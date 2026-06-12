import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);

// ELEMENTOS
const videoInput = document.getElementById("video");
const preview = document.getElementById("preview");
const queue = document.getElementById("queue");
const status = document.getElementById("status");

// PREVIEW SINGLE
videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});

// EXTRAI NOME
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");
  return semExtensao.split("_anim")[0].trim();
}

// CRIA CARDS
videoInput.addEventListener("change", (event) => {
  queue.innerHTML = "";

  const files = Array.from(event.target.files);

  console.log("TOTAL FILES:", files.length);

  files.forEach((file, index) => {
    console.log("LOADING:", file.name);

    const url = URL.createObjectURL(file);
    const nome = extrairNomeArquivo(file.name);

    const div = document.createElement("div");
    div.className = "video-item";

    const video = document.createElement("video");
    video.src = url;
    video.width = 200;
    video.muted = true;
    video.controls = true;
    video.loop = true;
    video.autoplay = false;

    const inputNome = document.createElement("input");
    inputNome.value = nome;
    inputNome.className = `nome-${index}`;

    const inputTags = document.createElement("input");
    inputTags.placeholder = "Tags";
    inputTags.className = `tags-${index}`;

    const desc = document.createElement("textarea");
    desc.placeholder = "Descrição";
    desc.className = `desc-${index}`;

    div.appendChild(video);
    div.appendChild(inputNome);
    div.appendChild(inputTags);
    div.appendChild(desc);

    queue.appendChild(div);
  });
});

// UPLOAD TODOS
async function uploadVideo() {
  const files = Array.from(videoInput.files);

  if (!files.length) {
    status.innerText = "Selecione um vídeo.";
    return;
  }

  status.innerText = "Enviando vídeos...";

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase
      .storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    const { data } = supabase
      .storage
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

// UPLOAD INDIVIDUAL
async function uploadSingle(index) {
  const files = Array.from(videoInput.files);
  const file = files[index];

  const nome = document.querySelector(`.nome-${index}`).value;
  const tags = document.querySelector(`.tags-${index}`).value;
  const descricao = document.querySelector(`.desc-${index}`).value;

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

// BOTÃO
document
  .getElementById("btnUpload")
  .addEventListener("click", uploadVideo);