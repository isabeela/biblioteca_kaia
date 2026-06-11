let todosVideos = [];

fetch(
   "https://opensheet.elk.sh/1TbeO6CjnHWwOm1hdwhVRFMIBGLPkdXpILSEA_9D2bSM/teste"
)
.then(response => response.json())
.then(videos => {

  todosVideos = videos;

  renderizarVideos(videos);

})
.catch(error => {

  console.error(error);

});

function converterUrlDrive(url) {

  const match = url.match(/\/d\/([^/]+)/);

  if (!match) return url;

  const id = match[1];

  return `https://drive.google.com/uc?export=view&id=${id}`;

}

function renderizarVideos(videos) {

  const gallery = document.getElementById("gallery");

  let html = "";

  videos.forEach(video => {

    const tags = video.tags
      ? video.tags.split(",")
      : [];

    const tagsHtml = tags
      .map(tag => `<span>${tag.trim()}</span>`)
      .join("");

    const urlImagem = converterUrlDrive(video.Url);

    html += `
      <div class="video-card">

        <div class="video-preview">

          <img
            src="${urlImagem}"
            alt="${video.Nome}"
            loading="lazy"
            onload="console.log('CARREGOU:', this.src)"
            onerror="console.log('ERRO:', this.src)"
          >

        </div>

        <div class="content">

          <h3>${video.Nome || ""}</h3>

          <div class="tags">
            ${tagsHtml}
          </div>

          <div class="tag-form">

            <input
              type="text"
              placeholder="Nova etiqueta"
            >

            <button>
              Adicionar
            </button>

          </div>

        </div>

      </div>
    `;

  });

  gallery.innerHTML = html;

}

document
.getElementById("search")
.addEventListener("input", function () {

  const termo = this.value.toLowerCase();

  const filtrados = todosVideos.filter(video => {

    const nome = (video.Nome || "").toLowerCase();

    const tags = (video.tags || "").toLowerCase();

    return (
      nome.includes(termo) ||
      tags.includes(termo)
    );

  });

  renderizarVideos(filtrados);

});