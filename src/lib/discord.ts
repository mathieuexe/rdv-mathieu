export async function sendDiscordNotification(message: string) {
  const discordWebhookUrl = "https://discord.com/api/webhooks/1535028962936356965/iDGt-1WOMEMvESkTXCVOr4u72vJtwLNpLHwaJ9cYMSnrUt26yMv_8PNVhCnGdafcwjyD";
  const stoatWebhookUrl = "https://stoat.chat/api/webhooks/01KZCDZ99QXZMNQMH7GFX7TGG2/4_kg-Fbxb2x_plYpasCiVay5c8Kjf837ursqRAiUGuPbfkTICRz7D_LdB-WqFdk_";
  
  try {
    // Send to Discord
    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    // Send to Stoat
    await fetch(stoatWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (error) {
    console.error("Failed to send notification", error);
  }
}
