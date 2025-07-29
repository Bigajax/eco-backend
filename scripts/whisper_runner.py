import sys
from faster_whisper import WhisperModel

# ✅ Substituído 'base' por 'small' para melhor precisão
model = WhisperModel("small")  # Pode usar "medium" se quiser ainda mais qualidade

audio_path = sys.argv[1]
segments, _ = model.transcribe(audio_path)

full_text = ""
for segment in segments:
    full_text += segment.text + " "

print(full_text.strip())
