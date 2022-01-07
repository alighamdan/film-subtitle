import axios from "axios";
import { parseHTML } from "linkedom";
import isOnline from "is-online";
import { textSync } from "figlet";
import terminalLink from "terminal-link";
import { createSupportsColor } from "supports-color";
import prompts from "prompts";
import { unusedFilenameSync } from "unused-filename";
import eachAsync from "each-async";
import { writeFileSync } from "fs";
import chalk from "chalk";
import { homedir } from "os";
import { execFileSync } from "child_process";

class FilmSubtitle {
  constructor() {}

  async suggestions(filmName: string): Promise<{
    query: string;
    suggestions: { value: string; data: { text: string; image: string } }[];
  }> {
    return (
      await axios.get(
        `https://isubtitles.org/ajax/suggestion?query=${filmName.replace(
          /\s/g,
          "+"
        )}`
      )
    ).data;
  }

  async subtitles(filmName: string): Promise<
    Array<{
      filmName: string;
      subtitles: {
        movie_release: string;
        language: string;
        createdAt: string;
        size: string | number;
        comment: string | null;
        downloadUrl: string;
      }[];
    }>
  > {
    let suggestions = await this.suggestions(filmName);
    var data = [];
    return new Promise((resolve, reject) => {
      eachAsync(
        suggestions.suggestions,
        ({ value }: { value: string }, i, done) => {
          let url = `https://isubtitles.org${value}`;
          axios.get(url).then(({ data: html }) => {
            let doc = parseHTML(html).window.document;

            let downloads: string[] = toArray(
              doc.querySelectorAll("[data-title=Download]")
            ).map((e: any) => e.querySelector("a").href);
            let languages: string[] = toArray(
              doc.querySelectorAll("[data-title=Language]")
            ).map((e) => e.textContent);
            let Movie: string[] = toArray(
              doc.querySelectorAll(
                '.movie-release[data-title="Release / Movie"]'
              )
            ).map((e: any) => e.querySelector("a").textContent.trim());
            let created: string[] = toArray(
              doc.querySelectorAll(".text-nowrap[data-title=Created]")
            ).map((e) => e.textContent.trim());
            let sizes: string[] = toArray(
              doc.querySelectorAll(".text-nowrap[data-title=Size]")
            ).map((e) => e.textContent.trim());
            let comments: string[] = toArray(
              doc.querySelectorAll(".movie-release[data-title=Comment]")
            ).map((e) => e.textContent.trim());

            data.push({
              filmName: suggestions.suggestions[i].data.text,
              subtitles: downloads
                .map((durl, index) => {
                  return {
                    movie_release: Movie[index],
                    language: languages[index].trim(),
                    createdAt: created[index],
                    size: isNaN(parseInt(sizes[index]))
                      ? sizes[index]
                      : parseInt(sizes[index]),
                    comment: Boolean(comments[index]) ? comments[index] : null,
                    downloadUrl: `https://isubtitles.org${durl}`,
                  };
                })
                .filter((e) => e.language != null),
            });
            done();
          });
        },
        (err) => {
          if (err) return reject(err);
          return resolve(data);
        }
      );
    });
  }
}

function toArray(nodelist: NodeList) {
  return Array.from(nodelist);
}

(async () => {
  let supportsColors = createSupportsColor(process.stdout);
  var points = ".";
  var i1 = setInterval(() => {
    if (supportsColors) {
      process.stdout.write(
        "\r" +
          chalk.bold.yellow("Please Wait! Checking Wifi Connection" + points)
      );
    } else {
      process.stdout.write("\rPlease Wait! Checking Wifi Connection" + points);
    }
    if (points.length >= 3) return (points = ".");
    points += ".";
  }, 250);

  let online = await isOnline({ timeout: 2000 });
  clearInterval(i1);
  console.clear();
  if (!online) {
    if (supportsColors) {
      console.log(
        chalk.bold.red(`You Are Offline! Please Try When You Back Online`)
      );
    } else {
      console.log(`You Are Offline! Please Try When You Back Online`);
    }
    return;
  }
  let text = textSync("Ali Dev", { font: "Larry 3D" });
  if (supportsColors) {
    console.log(
      chalk.bold.blue(`This Tool Created By`),
      terminalLink("Ali Dev", "https://github.com/alighamdan")
    );
    console.log(chalk.blue(text));
  } else {
    console.log(
      `This Tool Created By`,
      terminalLink("Ali Dev", "https://github.com/alighamdan")
    );
    console.log(text);
  }

  let { film } = await prompts({
    name: "film",
    type: "text",
    message: "film Name",
    hint: "The film name To Get the subtitles",
  });

  let filename = unusedFilenameSync(homedir + "/Desktop" + `/${film}.txt`);

  let films = await new FilmSubtitle().subtitles(film);

  if (films.length === 0) {
    return console.log(`No Result for ${film}`);
  }

  let data =
    `I Got For You ${films.length} Film\n\n` +
    films
      .map((e) => {
        return `Film Name: ${
          e.filmName
        }\nsubTitles:\n-----------------------------------------------------------------------------------------\n${e.subtitles
          .map((s) => {
            return `Movie/Release: ${s.movie_release}\nLanguage: ${s.language}\nComment: ${s.comment}\nTranslate File Size: ${s.size}KB\nCreatedAt: ${s.createdAt}\nDownloadUrl: ${s.downloadUrl}`;
          })
          .join(
            "\n-----------------------------------------------------------------------------------------\n"
          )}`;
      })
      .join(
        "\n____________________________________________________________________________________________________________________\n"
      );

  writeFileSync(filename, data);
  execFileSync("notepad ", [`"${filename}"`]);
})();
