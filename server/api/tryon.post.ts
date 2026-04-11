import Replicate from "replicate";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const replicate = new Replicate({
    auth: config.replicateApiToken,
  });

  try {
    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      {
        input: {
          human_img: body.userImage,
          garm_img: body.garmImg,
          garment_des: body.garmentDes || "clothing item",
        },
      },
    );

    return {
      result_url:
        output && typeof output === "object" && "url" in output
          ? (output as { url: () => string }).url()
          : output,
    };
  } catch (err: any) {
    console.error("Replicate try-on failed:", err);

    return {
      error: err?.message || "Replicate failed",
    };
  }
});