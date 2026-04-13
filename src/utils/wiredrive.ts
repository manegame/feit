import { XMLParser } from "fast-xml-parser";

export const getDataFromRSS = (rssUrl: string) => {
    return fetch(rssUrl)
        .then((res) => res.text())
        .then((str) => {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "",
                attributesGroupName: "",
            });

            try {
                const xmlDoc = parser.parse(str);

                const video = xmlDoc.rss.channel.item["media:content"];
                const posters = xmlDoc.rss.channel.item["media:thumbnail"];

                // get poster where width is bigger
                const poster = posters.reduce((prev: any, current: any) => {
                    return parseInt(current.width) > parseInt(prev.width)
                        ? current
                        : prev;
                });

                return {
                    video,
                    poster,
                };
            } catch (error) {
                console.error("Failed to parse RSS feed:", rssUrl);
                return {
                    video: null,
                    poster: null,
                };
            }
        });
};
