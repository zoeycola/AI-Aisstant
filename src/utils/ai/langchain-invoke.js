import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_AI_API_KEY,
    dangerouslyAllowBrowser: true,
    baseURL: import.meta.env.VITE_AI_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

export async function invokeAI(prompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.log(`错误信息：${error}`);
        console.log("请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code");
        throw error;
    }
}