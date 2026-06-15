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

//
// DRAG & DROP
//
const dropZone = document.getElementById("drop-zone");

// clicar na área
dropZone.addEventListener("click", () => {
    videoInput.click();
});

// arrastando sobre a área
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

// saiu da área
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// soltou arquivos
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();

    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;

    if (!files.length) return;

    // coloca os arquivos no input
    const dataTransfer = new DataTransfer();

    Array.from(files).forEach(file => {
        dataTransfer.items.add(file);
    });

    videoInput.files = dataTransfer.files;

    // dispara o mesmo evento usado pelo botão escolher arquivos
    videoInput.dispatchEvent(
        new Event("change", { bubbles: true })
    );
});

// EXTRAI NOME LIMPO
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/.[^/.]+$/, "");
  return semExtensao.split("_anim")[0].trim();
}


let todasTags = [];
async function carregarTags() {

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  todasTags = data;
}

carregarTags();


videoInput.addEventListener("change", (event) => {
  queue.innerHTML = "";

  const files = Array.from(event.target.files);

  if (!files.length) return;

  // LISTA
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const nome = extrairNomeArquivo(file.name);

    const card = document.createElement("div");
    card.className = "video-item";

    const video = document.createElement("video");

    video.className = "preview-video";
    video.controls = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    video.src = url;
    video.style.display = "block";

    const title = document.createElement("p");
    title.textContent = nome;

    const selectTags = document.createElement("select");

    selectTags.multiple = true;
    selectTags.className = `tags-${index}`;

    todasTags.forEach(tag => {

      const option = document.createElement("option");

      option.value = tag.nome;

      option.textContent =
        `${tag.emoji || ""} ${tag.nome}`;

      selectTags.appendChild(option);

    });

   

    const desc = document.createElement("textarea");
    desc.placeholder = "Descrição";
    desc.className = `desc-${index}`;

    const btn = document.createElement("button");
    btn.textContent = "Enviar este vídeo";

    // 🔥 IMPORTANTE: capturar file direto (não index)
   btn.onclick = () =>
    uploadSingleFile(
      file,
      desc,
      index
    );

    card.appendChild(video);
    card.appendChild(title);
    card.appendChild(selectTags);
    card.appendChild(desc);
    card.appendChild(btn);

    queue.appendChild(card);
    new TomSelect(selectTags, {
      plugins: ["remove_button"],
      create: false
    });
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

  status.innerText = `Enviando ${files.length} vídeos...`;

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    const tagsSelecionadas =
      Array.from(
        document.querySelector(`.tags-${i}`).selectedOptions
      )
      .map(option => option.value);

    const descricao =
      document.querySelector(`.desc-${i}`)?.value || "";

    const nome = extrairNomeArquivo(file.name);

    const fileName = `${Date.now()}-${file.name}`;

    // Upload Storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    // URL pública
    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    // Banco
    const { error: dbError } = await supabase
      .from("biblioteca")
      .insert([
        {
          nome,
          descricao,
          tags: tagsSelecionadas.join(","),
          personagem: "",
          url
        }
      ]);

    if (dbError) {
      console.error(dbError);
    }
  }

  status.innerText = "✅ Todos os vídeos foram enviados!";
}

//
// 🎯 UPLOAD INDIVIDUAL
//
async function uploadSingleFile(file, descEl, index) {
  const tags =
  Array.from(
    document.querySelectorAll(
      `.video-tag-${index}:checked`
    )
  )
.map(el => el.value)
.join(",");
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