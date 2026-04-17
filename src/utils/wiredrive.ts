import { XMLParser } from "fast-xml-parser";

const EMPTY_RSS = { video: null, poster: null };

export const getDataFromRSS = (rssUrl: string) => {
    return fetch(rssUrl)
        .then((res) => {
            if (!res.ok) {
                console.error(`RSS feed ${rssUrl} responded ${res.status}`);
                return null;
            }
            return res.text();
        })
        .catch((error) => {
            console.error("Failed to fetch RSS feed:", rssUrl, error);
            return null;
        })
        .then((str) => {
            if (!str) return EMPTY_RSS;

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
                return EMPTY_RSS;
            }
        });
};
