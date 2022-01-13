import axios from "axios";
import { parseHTML } from "linkedom";
import isOnline from "is-online";
import figlet from "figlet";
import terminalLink from "terminal-link";
import { createSupportsColor } from "supports-color";
import prompts from "prompts";
import { unusedFilenameSync } from "unused-filename";
import eachAsync from "each-async";
import { writeFileSync } from "fs";
import chalk from "chalk";
import { homedir } from "os";
import { execSync } from "child_process";
import { marked } from "marked";
import nodeHtmlToImage from "node-html-to-image";
import { getEdgePath } from "edge-paths";
import yaml_1 from 'yaml';
import { createInterface } from 'readline';
const yaml = yaml_1
const { textSync } = figlet;
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

class FilmSubtitle {
    constructor() { }

    async suggestions(filmName) {
        return (
            await axios.get(
                `https://isubtitles.org/ajax/suggestion?query=${filmName.replace(
                    /\s/g,
                    "+"
                )}`
            )
        ).data;
    }

    async subtitles(filmName) {
        let suggestions = await this.suggestions(filmName);
        var data = [];
        return new Promise((resolve, reject) => {
            eachAsync(
                suggestions.suggestions,
                ({ value }, i, done) => {
                    let url = `https://isubtitles.org${value}`;
                    axios.get(url).then(({ data: html }) => {
                        let doc = parseHTML(html).window.document;

                        let downloads = toArray(
                            doc.querySelectorAll("[data-title=Download]")
                        ).map((e) => e.querySelector("a").href);
                        let languages = toArray(
                            doc.querySelectorAll("[data-title=Language]")
                        ).map((e) => e.textContent);
                        let Movie = toArray(
                            doc.querySelectorAll(
                                '.movie-release[data-title="Release / Movie"]'
                            )
                        ).map((e) => e.querySelector("a").textContent.trim());
                        let created = toArray(
                            doc.querySelectorAll(".text-nowrap[data-title=Created]")
                        ).map((e) => e.textContent.trim());
                        let sizes = toArray(
                            doc.querySelectorAll(".text-nowrap[data-title=Size]")
                        ).map((e) => e.textContent.trim());
                        let comments = toArray(
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

function toArray(nodelist) {
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
        rl.question(`Press Any Key To Exit...`, () => { process.exit(0); });
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

    let { film, types, path } = await prompts([
        {
            name: "film",
            type: "text",
            message: "film Name",
            hint: "The film name To Get the subtitles",
        },
        {
            name: "types",
            type: "select",
            message: "What Type You Need?",
            choices: [
                {
                    title: "markdown",
                    value: "md",
                    description: "extract As .md File",
                },
                {
                    title: "html",
                    value: "html",
                    description: "extract As .html File",
                },
                {
                    title: "Image",
                    value: "png",
                    description: "extract As .png File",
                },
                {
                    title: "json",
                    value: "json",
                    description: "extract As .json File"
                },
                {
                    title: 'yaml',
                    value: 'yaml',
                    description: 'extract As .yaml File'
                }
            ],
        },
        {
            name: "path",
            type: "text",
            message: "Your Browser Directory",
            hint: "Only Required If You Choice Extract As .png",
        },
    ]);

    let filename = unusedFilenameSync(homedir + "/Desktop" + `/${film}.${types}`);

    let films = await new FilmSubtitle().subtitles(film);

    if (films.length === 0) {
        return console.log(`No Result for ${film}`);
    }

    var data =
        "I Got For You " +
        films.length +
        " Film\n\n" +
        films.map(function (e) {
            return `# ${e.filmName}\n## subtitles:\n ${e.subtitles
                .filter((e) => e.size !== 0)
                .map((s, index) => {
                    return `### ${index + 1}- Movie/Release: ${s.movie_release
                        }\n### Language: ${s.language}\n${s.comment ? `Comment: ${s.comment}\n` : ""
                        }### Translate File Size: ${s.size}KB\n### CreatedAt: ${s.createdAt
                        }\n### Download Translate File: ${s.downloadUrl}\n`;
                })
                .join("\n\n")}`;
        });

    if (types === "md") {
        writeFileSync(filename, data);
    } else if (types === "html") {
        writeFileSync(filename, marked.parse(data));
    } else if (types === 'png') {
        writeFileSync(
            filename,
            await nodeHtmlToImage({
                html: marked.parse(data),
                puppeteerArgs: { executablePath: path !== "" ? path : getEdgePath() },
            })
        )
    } else if (types === 'json') {
        writeFileSync(filename, JSON.stringify(films));
    }else if (types === 'yaml') {
        writeFileSync(filename, yaml.stringify(films));
    }
    execSync(`"${filename}"`);
})();
