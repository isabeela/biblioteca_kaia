import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);

// preview
const videoInput = document.getElementById("video");
const preview = document.getElementById("preview");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});

// extrair nome
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");
  const parteAntesAnim = semExtensao.split("_anim")[0];
  return parteAntesAnim.trim();
}
const queue = document.getElementById("queue");

videoInput.addEventListener("change", () => {
  queue.innerHTML = "";

  const files = Array.from(videoInput.files);

  files.forEach((file, index) => {
    const nome = extrairNomeArquivo(file.name);
    const previewUrl = URL.createObjectURL(file);

    const div = document.createElement("div");

    div.className = "video-item";

    div.innerHTML = `
      <video src="${previewUrl}" width="200" muted loop autoplay></video>

      <input type="text" placeholder="Nome" value="${nome}" class="nome-${index}">
      <input type="text" placeholder="Tags (ex: futebol, gol)" class="tags-${index}">
      <textarea placeholder="Descrição" class="desc-${index}"></textarea>

      <button onclick="uploadSingle(${index})">Enviar este vídeo</button>
    `;

    queue.appendChild(div);
  });
});

async function uploadVideo() {
  const files = Array.from(videoInput.files);
  const status = document.getElementById("status");

  if (!files.length) {
    status.innerText = "Selecione um vídeo.";
    return;
  }

  const nome = extrairNomeArquivo(file.name);
  const descricao = document.getElementById("descricao").value;
  const tags = document.getElementById("tags").value;

  status.innerText = "Enviando vídeos...";

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;

    // 1. upload
    const { error: uploadError } = await supabase
      .storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    // 2. URL
    const { data } = supabase
      .storage
      .from("videos")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    // 3. nome automático
    const nome = extrairNomeArquivo(file.name);

    // 4. insert banco
    const { error: dbError } = await supabase
      .from("biblioteca")
      .insert([
        {
          nome,
          descricao,
          personagem,
          tags,
          url
        }
      ]);

    if (dbError) {
      console.error(dbError);
    }
  }

  status.innerText = "Upload concluído com sucesso!";
}

async function uploadSingle(index) {
  const files = Array.from(document.getElementById("video").files);
  const file = files[index];

  const nome = document.querySelector(`.nome-${index}`).value;
  const tags = document.querySelector(`.tags-${index}`).value;
  const descricao = document.querySelector(`.desc-${index}`).value;

  const fileName = `${Date.now()}-${file.name}`;

  // 1. upload
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  // 2. url
  const { data } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);

  const url = data.publicUrl;

  // 3. banco
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



document
  .getElementById("btnUpload")
  .addEventListener("click", uploadVideo);