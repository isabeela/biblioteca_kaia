import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);

// ELEMENTOS
const videoInput = document.getElementById("video");
const queue = document.getElementById("queue");
const status = document.getElementById("status");

// EXTRAI NOME LIMPO
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");
  return semExtensao.split("_anim")[0].trim();
}

// CRIAR CARDS
videoInput.addEventListener("change", () => {
  queue.innerHTML = "";

  const files = Array.from(videoInput.files);

  files.forEach((file, index) => {
    const previewUrl = URL.createObjectURL(file);
    const nome = extrairNomeArquivo(file.name);

    const div = document.createElement("div");
    div.className = "video-item";

    const video = document.createElement("video");

    video.src = previewUrl;
    video.width = 220;
    video.muted = true;
    video.controls = true;
    video.loop = true;
    video.playsInline = true;

    // força carregamento (IMPORTANTE)
    video.load();

    const tags = document.createElement("input");
    tags.placeholder = "Tags";
    tags.className = `tags-${index}`;

    const desc = document.createElement("textarea");
    desc.placeholder = "Descrição";
    desc.className = `desc-${index}`;

    const title = document.createElement("p");
    title.innerHTML = `<strong>${nome}</strong>`;

    div.appendChild(video);
    div.appendChild(tags);
    div.appendChild(desc);
    div.appendChild(title);

    queue.appendChild(div);
  });
});

// UPLOAD TODOS
async function uploadTodos() {
  const files = Array.from(videoInput.files);

  if (!files.length) {
    status.innerText = "Selecione vídeos.";
    return;
  }

  status.innerText = "Enviando vídeos...";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const tags = document.querySelector(`.tags-${i}`).value;
    const descricao = document.querySelector(`.desc-${i}`).value;

    const fileName = `${Date.now()}-${file.name}`;

    // 1. UPLOAD STORAGE
    const { error: uploadError } = await supabase
      .storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    // 2. URL pública
    const { data } = supabase
      .storage
      .from("videos")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    // 3. nome automático
    const nome = extrairNomeArquivo(file.name);

    // 4. salvar no banco
    const { error: dbError } = await supabase
      .from("biblioteca")
      .insert([
        {
          nome,
          tags,
          descricao,
          url
        }
      ]);

    if (dbError) {
      console.error(dbError);
    }
  }

  status.innerText = "Upload concluído!";
}

// BOTÃO
document
  .getElementById("btnUpload")
  .addEventListener("click", uploadTodos);