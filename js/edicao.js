async function abrirModalTag(id){

    videoSelecionado = id;

    console.log("Vídeo selecionado:", id);
    const { data: video, error } = await db
        .from("biblioteca")
        .select("nome, tags")
        .eq("id", id)
        .single();

    if(error){
        console.log(error);
        return;
    }

     const titulo = document.getElementById("tituloModalTag");

    if (titulo) {
        titulo.innerText = `Editar Tags | ${video.nome || "Sem nome"}`;
    }


    const tagsAtuais =
        video?.tags
        ? video.tags.split(",").filter(Boolean)
        : [];

    await carregarTagsModal(tagsAtuais);

    document
        .getElementById("modalTag")
        .classList.add("show");
}
// =====================================
// CARREGAR TODAS AS TAGS NO SELECT
// =====================================

async function carregarTagsModal(tagsAtuais = []){

    const { data: tags, error } = await db
        .from("tags")
        .select("*")
        .order("nome");

    if(error){

        console.log(error);

        return;
    }

    const select =
        document.getElementById("selectTagsVideo");

    select.innerHTML = "";

    tags.forEach(tag => {

        const option =
            document.createElement("option");

        option.value = tag.nome;

        option.textContent =
            `${tag.emoji || ""} ${tag.nome}`;

        select.appendChild(option);

    });


    // Destroi TomSelect anterior

    if(tomTagsVideo){

        tomTagsVideo.destroy();

    }


    tomTagsVideo = new TomSelect(
        "#selectTagsVideo",
        {

            plugins:["remove_button"],

            create:false,

            persist:false

        }
    );


    // Marca as tags já existentes

    tomTagsVideo.setValue(tagsAtuais);

}



// =====================================
// SALVAR TAGS
// =====================================

async function salvarTagsVideo(){

    if(!videoSelecionado){

        alert("Nenhum vídeo selecionado");
        return;

    }

    const tagsSelecionadas =
        tomTagsVideo.getValue();

    console.log("Tags:", tagsSelecionadas);

    const tagsString =
        Array.isArray(tagsSelecionadas)
        ? tagsSelecionadas.join(",")
        : tagsSelecionadas;

    console.log("Salvar:", tagsString);

    const { data, error } = await db
        .from("biblioteca")
        .update({

            tags: tagsString

        })
        .eq("id", videoSelecionado)
        .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if(error){

        alert("Erro ao salvar");
        return;

    }

    alert("Salvo com sucesso");
    fecharModalTag();
    await carregarVideos();

}



// =====================================
// FECHAR MODAL
// =====================================

function fecharModalTag(){

    document
        .getElementById("modalTag")
        .classList.remove("show");

}

// =====================================
// EVENTOS
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const btn =
        document.getElementById("saveTagsVideo");

    if(btn){

        btn.addEventListener(
            "click",
            salvarTagsVideo
        );

    }

});

// ADICIONAR DESCRIÇÃO

let videoEditando = null;

async function abrirEditar(id) {

    videoEditando = id;

    const { data: video, error } = await db
        .from("biblioteca")
        .select("descricao, nome")
        .eq("id", id)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    document.getElementById("editDescricao").value =
        video.descricao || "";

    document.getElementById("editTitulo").innerText =
        video.nome || "Editar vídeo";

    document.getElementById("modalEditar").classList.add("show");
}


async function salvarEdicao() {

    const descricao =
        document.getElementById("editDescricao").value;

    const { error } = await db
        .from("biblioteca")
        .update({
            descricao: descricao
        })
        .eq("id", videoEditando);

    if (error) {
        console.log(error);
        alert("Erro ao salvar");
        return;
    }

    alert("Descrição atualizada!");

    location.reload();

}


function fecharEditar() {
    document.getElementById("modalEditar").classList.remove("show");
}


async function deletarVideo(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este vídeo?"
    );

    if (!confirmar) return;

    // Busca a URL do vídeo
    const { data: video, error: erroBusca } = await db
        .from("biblioteca")
        .select("url")
        .eq("id", id)
        .single();

    if (erroBusca) {
        console.log(erroBusca);
        alert("Erro ao localizar vídeo");
        return;
    }

    // Remove arquivo do Storage
    if (video?.url) {

        const fileName =
            video.url.split("/").pop();

        const { error: erroStorage } =
            await db.storage
                .from("videos")
                .remove([fileName]);

        if (erroStorage) {
            console.log(erroStorage);
        }
    }

    // Remove do banco
    const { error: erroBanco } = await db
        .from("biblioteca")
        .delete()
        .eq("id", id);

    if (erroBanco) {

        console.log(erroBanco);

        alert("Erro ao excluir vídeo");

        return;
    }

    // Remove da tela
    todosVideos =
        todosVideos.filter(v => v.id !== id);

    videosFiltrados =
        videosFiltrados.filter(v => v.id !== id);

    document.getElementById("gallery").innerHTML = "";

    paginaAtual = 0;

    renderizarMaisVideos();

    alert("Vídeo excluído com sucesso!");
}