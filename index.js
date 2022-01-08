"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
          resolve(value);
        });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: [],
    },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
      (g[Symbol.iterator] = function () {
        return this;
      }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
              y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
import axios_1 from "axios";
import { parseHTML } from "linkedom";
import is_online_1 from "is-online";
import figlet from "figlet";
import terminal_link_1 from "terminal-link";
import supports_color_1 from "supports-color";
import prompts_1 from "prompts";
import { unusedFilenameSync } from "unused-filename";
import each_async_1 from "each-async";
import fs_1 from "fs";
import chalk_1 from "chalk";
import os_1 from "os";
import child_process_1 from "child_process";
const figlet_1 = figlet;

var FilmSubtitle = /** @class */ (function () {
  function FilmSubtitle() { }
  FilmSubtitle.prototype.suggestions = function (filmName) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              axios_1.get(
                "https://isubtitles.org/ajax/suggestion?query=" +
                filmName.replace(/\s/g, "+")
              ),
            ];
          case 1:
            return [2 /*return*/, _a.sent().data];
        }
      });
    });
  };
  FilmSubtitle.prototype.subtitles = function (filmName) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.suggestions(filmName)];
          case 1:
            suggestions = _a.sent();
            data = [];
            return [
              2 /*return*/,
              new Promise(function (resolve, reject) {
                (0, each_async_1)(
                  suggestions.suggestions,
                  function (_a, i, done) {
                    var value = _a.value;
                    var url = "https://isubtitles.org" + value;
                    axios_1.get(url).then(function (_a) {
                      var html = _a.data;
                      var doc = (0, parseHTML)(html).window.document;
                      var downloads = toArray(
                        doc.querySelectorAll("[data-title=Download]")
                      ).map(function (e) {
                        return e.querySelector("a").href;
                      });
                      var languages = toArray(
                        doc.querySelectorAll("[data-title=Language]")
                      ).map(function (e) {
                        return e.textContent;
                      });
                      var Movie = toArray(
                        doc.querySelectorAll(
                          '.movie-release[data-title="Release / Movie"]'
                        )
                      ).map(function (e) {
                        return e.querySelector("a").textContent.trim();
                      });
                      var created = toArray(
                        doc.querySelectorAll(".text-nowrap[data-title=Created]")
                      ).map(function (e) {
                        return e.textContent.trim();
                      });
                      var sizes = toArray(
                        doc.querySelectorAll(".text-nowrap[data-title=Size]")
                      ).map(function (e) {
                        return e.textContent.trim();
                      });
                      var comments = toArray(
                        doc.querySelectorAll(
                          ".movie-release[data-title=Comment]"
                        )
                      ).map(function (e) {
                        return e.textContent.trim();
                      });
                      data.push({
                        filmName: suggestions.suggestions[i].data.text,
                        subtitles: downloads
                          .map(function (durl, index) {
                            return {
                              movie_release: Movie[index],
                              language: languages[index].trim(),
                              createdAt: created[index],
                              size: isNaN(parseInt(sizes[index]))
                                ? sizes[index]
                                : parseInt(sizes[index]),
                              comment: Boolean(comments[index])
                                ? comments[index]
                                : null,
                              downloadUrl: "https://isubtitles.org" + durl,
                            };
                          })
                          .filter(function (e) {
                            return e.language != null;
                          }),
                      });
                      done();
                    });
                  },
                  function (err) {
                    if (err) return reject(err);
                    return resolve(data);
                  }
                );
              }),
            ];
        }
      });
    });
  };
  return FilmSubtitle;
})();
function toArray(nodelist) {
  return Array.from(nodelist);
}
(function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var supportsColors, points, i1, online, text, film, filename, films, data;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          supportsColors = (0, supports_color_1.stdout.hasBasic);
          points = ".";
          i1 = setInterval(function () {
            if (supportsColors) {
              process.stdout.write(
                "\r" +
                chalk_1.bold.yellow(
                  "Please Wait! Checking Wifi Connection" + points
                )
              );
            } else {
              process.stdout.write(
                "\rPlease Wait! Checking Wifi Connection" + points
              );
            }
            if (points.length >= 3) return (points = ".");
            points += ".";
          }, 250);
          return [4 /*yield*/, (0, is_online_1)({ timeout: 2000 })];
        case 1:
          online = _a.sent();
          clearInterval(i1);
          console.clear();
          if (!online) {
            if (supportsColors) {
              console.log(
                chalk_1.bold.red(
                  "You Are Offline! Please Try When You Back Online"
                )
              );
            } else {
              console.log("You Are Offline! Please Try When You Back Online");
            }
            return [2 /*return*/];
          }
          text = (0, figlet_1.textSync)("Ali Dev", { font: "Larry 3D" });
          if (supportsColors) {
            console.log(
              chalk_1.bold.blue("This Tool Created By"),
              (0, terminal_link_1)("Ali Dev", "https://github.com/alighamdan")
            );
            console.log(chalk_1.blue(text));
          } else {
            console.log(
              "This Tool Created By",
              (0, terminal_link_1)("Ali Dev", "https://github.com/alighamdan")
            );
            console.log(text);
          }
          return [
            4 /*yield*/,
            (0, prompts_1)({
              name: "film",
              type: "text",
              message: "film Name",
              hint: "The film name To Get the subtitles",
            }),
          ];
        case 2:
          film = _a.sent().film;
          filename = (0, unusedFilenameSync)(
            os_1.homedir + "/Desktop" + ("/" + film + ".md")
          );
          return [4 /*yield*/, new FilmSubtitle().subtitles(film)];
        case 3:
          films = _a.sent();
          if (films.length === 0) {
            return [2 /*return*/, console.log("No Result for " + film)];
          }
          data =
            "I Got For You " +
            films.length +
            " Film\n\n" +
            films
              .map(function (e) {
                return `# ${e.filmName}\n## subtitles:\n ${e.subtitles.filter(e => e.size !== 0).map(
                  (s, index) => {
                    return `### ${index + 1}- Movie/Release: ${s.movie_release
                      }\n### Language: ${s.language}\n${s.comment ? `Comment: ${s.comment}\n` : ""
                      }### Translate File Size: ${s.size}KB\n### CreatedAt: ${s.createdAt}\n### [Download Translate File](${s.downloadUrl})`;
                  }
                ).join('\n<br />\n')}`;
              })
              .join("<hr />\n");
          (0, fs_1.writeFileSync)(filename, data);
          (0, child_process_1.execFileSync)("notepad", [filename]);
          console.log(`Created SuccessFully. The File dir:\n${filename}`);
          return [2 /*return*/];
      }
    });
  });
})();
