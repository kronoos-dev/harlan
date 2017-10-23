module.exports = (controller) => {
    if (controller.confs.kronoos.isKronoos) {
        $("#login-about").text("Soluções na implementação de práticas relacionadas à " +
            "responsabilidade socioambiental e anticorrupção.");
    }
};
