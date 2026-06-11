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

function renderizarVideos(videos){

  const gallery =
  document.getElementById("gallery");

gallery.innerHTML = "";

videos.forEach(video => {

    const tags =
      video.tags
        ? video.tags.split(",")
        : [];

    const tagsHtml =
      tags.map(tag =>
        `<span>${tag.trim()}</span>`
      ).join("");

    gallery.innerHTML += `

    <div class="video-card">
        <div class="video-preview">
          <img src="${converterUrlDrive(video.Url)}" width="100%" height="220"  loading="lazy">

            <div class="content">

                <h3>${video.Nome}</h3>

                <div class="tags">
                    ${tagsHtml}
                </div>

                <div class="tag-form">

                    <input
                        type="text"
                        placeholder="Nova etiqueta">

                    <button>
                        Adicionar
                    </button>

                </div>

            </div>
        </div>
    </div>

    `;
});


}



document
.getElementById("search")
.addEventListener("input", function(){

    const termo =
      this.value.toLowerCase();

    const filtrados =
      todosVideos.filter(video => {

        return (
          video.nome.toLowerCase()
          .includes(termo)

          ||

          video.tags.toLowerCase()
          .includes(termo)
        );

      });

    renderizarVideos(filtrados);
});

function converterUrlDrive(url) {
    const match = url.match(/\/d\/([^/]+)/);

    if (!match) return url;

    const id = match[1];

    return `https://drive.google.com/uc?export=view&id=${id}`;
}