import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [ImagePrompt, setImagePrompt] = useState(""); 
  const [ImageQuality, setImageQuality] = useState("hd"); // 'hd', 'standard'
  const [ImageResolution, setImageResolution] = useState("1792x1024"); // 1024x1024, 1024x1792, 1792x1024
  const [ImageStyle, setImageStyle] = useState("vivid"); // 'vivid' or 'natural'
  const [ImagePromptStyle, setImagePromptStyle] = useState("dalle3"); // 'dalle3' => no pre-prompt D3 does prompt-enhancement; 'gpt4' => pass to GPT4 to enhance prompt

  const [result, setResult] = useState();
  const [revised_prompt, setRevisedPrompt] = useState();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/image-gen/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          image_prompt: ImagePrompt,
          image_resolution: ImageResolution,
          image_quality: ImageQuality,
          image_style: ImageStyle,
          image_prompt_style: ImagePromptStyle
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setRevisedPrompt(data.revised_prompt);
    } catch(error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const [advancedSettingsVisible, setAdvancedSettingsVisible] = useState(false);
  return (
    <div>
      <Head>
        <title>Vectura.ai - simple DALL-E3 FrontEnd</title>
        <link rel="icon" href="/image-gen/vai-dalle-gen-icon.png" />
      </Head>

      <main className={styles.main}>
        <img src="/image-gen/vai-dalle-gen.png" className={styles.icon} />
        <h4>Vectura.ai - simple DALL-E FrontEnd</h4>
        <form onSubmit={onSubmit}>
          <a href="#" onClick={() => setAdvancedSettingsVisible(!advancedSettingsVisible)}>Advanced settings</a>
          {advancedSettingsVisible && (
            <>
              <div style={{border: '1px solid #10a37f', borderRadius: '5px', padding: '12px 16px'}}>
                <p>
                  <label>
                    Quality: &nbsp;
                    <select defaultValue={ImageQuality} name="image_quality" onChange={(e) => setImageQuality(e.target.value)}>
                      <option value="hd">High Quality (Slow)</option>
                      <option value="standard">Standard Quality (Fast)</option>
                    </select>
                  </label>
                </p>
                <p>
                  <label>
                    Resolution: &nbsp;
                    <select defaultValue={ImageResolution} name="image_resolution" onChange={(e) => setImageResolution(e.target.value)}>
                      <option value="1024x1024">1024x1024</option>
                      <option value="1024x1792">1024x1792</option>
                      <option value="1792x1024">1792x1024</option>
                    </select>
                  </label>
                </p>
                <p>
                  <label>
                    Image Style: &nbsp;
                    <select defaultValue={ImageStyle} name="image_style" onChange={(e) => setImageStyle(e.target.value)}>
                      <option value="natural">natural</option>
                      <option value="vivid">vivid</option>
                    </select>
                  </label>
                </p>             
                <p>
                  <label>
                    Prompt Style: &nbsp;
                    <select defaultValue={ImagePromptStyle} name="image_prompt_style" onChange={(e) => setImagePromptStyle(e.target.value)}>
                      <option value="dalle3">DALL-E3 native</option>
                      <option value="gpt4">GPT4 enhanced (ChatGPT+ default, slow)</option>                      
                      <option value="as-is">Use prompt AS-IS (by OpenAI API)</option>
                      <option value="replicate">Replicate detailed prompt (by OpenAI API)</option>
                      <option value="debug">Debug Mode (experimental)</option>
                    </select>
                  </label>
                </p>                     
              </div>
              <br />
            </>
          )}
          
          <textarea
            name="image_prompt"
            placeholder="A beautiful skyline of New York"
            value={ImagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            disabled={loading}
            rows="2"
          />
          <input type="submit" value={loading ? "Generating image..." : "Generate image"} disabled={loading} />
        </form>
        {loading && <div><small>The image is being generate, please wait</small></div>}
        <a href={result} target="_blank" rel="noopener noreferrer">
          {result && <img src={result} className={styles.result} />}
        </a>
        {result && revised_prompt && 
          <div className={styles.result}>
            <small>Revised prompt used to generate image:</small>
            <p>{revised_prompt}</p>
          </div>
        }
      </main>
    </div>
  );
}
