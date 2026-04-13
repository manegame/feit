import type { APIRoute } from "astro";

export const prerender = false;

export const POST = (async ({ request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        const body = await request.json();
        const videoUrl = body.video;

        const response = await fetch(videoUrl);

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    message: "Failed to fetch video",
                }),
                {
                    status: response.status,
                },
            );
        }

        return new Response(response.body, {
            status: response.status,
            headers: {
                "Content-Type":
                    response.headers.get("Content-Type") || "video/mp4",
            },
        });
    }

    return new Response(null, { status: 400 });
}) satisfies APIRoute;
