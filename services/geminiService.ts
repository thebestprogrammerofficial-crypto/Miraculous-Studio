
import { GoogleGenAI, Modality } from "@google/genai";
import { getSettings } from "./storageService";

const getClient = () => {
  const settings = getSettings();
  
  // Logic: Use Env Key if 'Auto' is true, otherwise use custom key
  const apiKey = settings.useAutoKey 
    ? process.env.API_KEY 
    : settings.customApiKey;

  if (!apiKey) {
    throw new Error("API Key not found. Please configure it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateEpisodeScript = async (
  showTitle: string, 
  episodeTitle: string, 
  premise: string,
  context: string = ""
): Promise<{ script: string; postCredit: string }> => {
  const ai = getClient();
  const settings = getSettings();
  
  const prompt = `
    You are a master scriptwriter for the animated series "Miraculous: Tales of Ladybug & Cat Noir".
    
    Context: The user is creating a fan-made season called "${showTitle}".
    Previous Episodes Context: ${context}
    
    Task: Write a full episode script for an episode titled "${episodeTitle}".
    Premise: ${premise}
    
    Requirements:
    1. Format it as a proper script (Scene headings, Character names, Dialogue, Action).
    2. Include a transformation sequence.
    3. Include the villain's akumatization moment by Hawkmoth (or current villain).
    4. Include the "Lucky Charm" sequence and the "Miraculous Ladybug" fix-everything ending.
    5. VERY IMPORTANT: Generate a POST-CREDIT SCENE that teases the future or adds comedy.
    6. SEPARATOR: You MUST output the line "---POST-CREDIT-SCENE---" between the main script and the post-credit scene.
    
    Tone: Exciting, heroic, romantic tension, puns from Cat Noir.
    Format: Use Markdown (bold names, italic actions).
  `;

  try {
    const response = await ai.models.generateContent({
      model: settings.scriptModel, // Uses dynamic model from settings
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    const fullText = response.text || "";
    const parts = fullText.split("---POST-CREDIT-SCENE---");
    
    return {
        script: parts[0].trim(),
        postCredit: parts[1] ? parts[1].trim() : "No post-credit scene generated."
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateShowIdeas = async (): Promise<string[]> => {
    const ai = getClient();
    // Usually uses a faster model for simple ideas, but we'll stick to the script model preference for consistency
    const settings = getSettings();
    const prompt = `Generate 3 creative, catchy titles for a new season or spinoff of Miraculous Ladybug. Return only the titles, separated by commas.`;
    
    try {
        const response = await ai.models.generateContent({
            model: settings.scriptModel,
            contents: prompt
        });
        const text = response.text || "";
        return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } catch (e) {
        return ["Tales of Paris", "The Lost Kwamis", "Future Imperfect"];
    }
};

export const generateSceneImage = async (description: string): Promise<string> => {
    const ai = getClient();
    const settings = getSettings();
    const model = settings.imageModel;
    
    const prompt = `A cinematic 3D animated style screenshot from Miraculous Ladybug. ${description}. High quality, vibrant colors, 4k.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: prompt }]
            },
            // Note: Different models accept different configs. 
            // gemini-3-pro-image-preview supports imageSize, but nano banana (2.5) might not.
            // keeping config minimal to ensure compatibility.
            config: {}
        });

        // We iterate parts to find the image
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                     return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("No image data received");
    } catch (error) {
        console.error("NanoBanana Image Gen Error:", error);
        throw error;
    }
};

export const generateScriptAudio = async (script: string): Promise<string> => {
    const ai = getClient();
    
    // We use a simplified version of the script to avoid token limits and ensure better TTS focus
    // Truncate if too long for a single pass, though for this demo we'll assume reasonable length
    const cleanScript = script.substring(0, 4000); 

    const prompt = `
      Perform the dialogue from the following script. 
      Important Instructions:
      1. ONLY read the spoken dialogue. Do NOT read scene headings, action descriptions, or character names.
      2. Use the Female voice (Kore) for Marinette, Ladybug, Tikki, Alya, and other female characters.
      3. Use the Male voice (Fenrir) for Adrien, Cat Noir, Hawkmoth, Plagg, and other male characters.
      
      Script:
      ${cleanScript}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Male Characters', // Adrien, Cat Noir, etc.
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
                            },
                            {
                                speaker: 'Female Characters', // Marinette, Ladybug, etc.
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                            }
                        ]
                    }
                }
            }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) throw new Error("No audio generated");
        return audioData;

    } catch (error) {
        console.error("TTS Generation Error:", error);
        throw error;
    }
};
