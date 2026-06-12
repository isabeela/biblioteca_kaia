import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);

// ELEMENTOS
const videoInput = document.getElementById("video");
const preview = document.querySelector(".preview-video");
const queue = document.getElementById("queue");
const status = document.getElementById("status");

// EXTRAI NOME LIMPO
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/.[^/.]+$/, "");
  return semExtensao.split("_anim")[0].trim();
}

//
// 🎬 PREVIEW PRINCIPAL + LISTA
//
videoInput.addEventListener("change", (event) => {
  queue.innerHTML = "";

  const files = Array.from(event.target.files);

  if (!files.length) return;

  // 🔵 PREVIEW PRINCIPAL
  const firstFile = files[0];
  preview.src = URL.createObjectURL(firstFile);
  preview.style.display = "block";

  // 🟢 LISTA
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const nome = extrairNomeArquivo(file.name);

    const card = document.createElement("div");
    card.className = "video-item";

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.muted = true;
    video.loop = true;
    video.width = 220;

    const title = document.createElement("p");
    title.textContent = nome;

    const tags = document.createElement("input");
    tags.placeholder = "Tags";
    tags.className = `tags-${index}`;

    const desc = document.createElement("textarea");
    desc.placeholder = "Descrição";
    desc.className = `desc-${index}`;

    const btn = document.createElement("button");
    btn.textContent = "Enviar este vídeo";

    // 🔥 IMPORTANTE: capturar file direto (não index)
    btn.onclick = () => uploadSingleFile(file, tags, desc);

    card.appendChild(video);
    card.appendChild(title);
    card.appendChild(tags);
    card.appendChild(desc);
    card.appendChild(btn);

    queue.appendChild(card);
  });
});

//
// 🚀 UPLOAD TODOS
//
async function uploadVideo() {
  const files = Array.from(videoInput.files);

  if (!files.length) {
    status.innerText = "Selecione vídeos.";
    return;
  }

  status.innerText = "Enviando vídeos...";

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    const nome = extrairNomeArquivo(file.name);

    const { error: dbError } = await supabase
      .from("biblioteca")
      .insert([
        {
          nome,
          descricao: "",
          personagem: "",
          tags: "",
          url
        }
      ]);

    if (dbError) {
      console.error(dbError);
    }
  }

  status.innerText = "Upload concluído!";
}

//
// 🎯 UPLOAD INDIVIDUAL
//
async function uploadSingleFile(file, tagsEl, descEl) {
  const tags = tagsEl.value;
  const descricao = descEl.value;

  const nome = extrairNomeArquivo(file.name);
  const fileName = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);

  const url = data.publicUrl;

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
    return;
  }

  alert("Vídeo enviado!");
}

//
// BOTÃO
//
document
  .getElementById("btnUpload")
  .addEventListener("click", uploadVideo);