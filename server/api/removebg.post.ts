export default defineEventHandler(async (event) => {
  const { removeBgApiKey } = useRuntimeConfig();

  const form = await readMultipartFormData(event);
  const file = form?.find((part) => part.name === "file" && part.data);

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded",
    });
  }

  const body = new FormData();
  body.append(
    "image_file",
    new Blob([file.data], { type: file.type || "application/octet-stream" }),
    file.filename || "upload.png",
  );
  body.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": removeBgApiKey,
    },
    body,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw createError({
      statusCode: res.status,
      statusMessage: errorText || "Background removal failed",
    });
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  return {
    image: `data:image/png;base64,${buffer.toString("base64")}`,
  };
});
