import Replicate from "replicate";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const replicate = new Replicate({
    auth: config.replicateApiToken,
  });

  try {
    const output = await replicate.run(
      "lucataco/oot-diffusion:dc1a91e3d9e8c5e1f3c6d4b1d8b6e4a4e2f3c1a2b3c4d5e6f7g8h9i0j1k2l3m",
      {
        input: {
          model_image: body.userImage,
          cloth_image: body.garmImg,
          category: body.category === "upper_body" ? "upper" : "lower",
        },
      },
    );

    return {
      result_url: Array.isArray(output) ? output[0] : output,
    };
  } catch (err: any) {
    return {
      error: err.message || "Replicate failed",
    };
  }
});
