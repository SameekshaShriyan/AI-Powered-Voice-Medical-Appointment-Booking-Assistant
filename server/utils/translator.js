function translate(language, english, hindi, kannada) {

    switch (language) {
        case "hi-IN":
            return hindi;

        case "kn-IN":
            return kannada;

        default:
            return english;
    }

}

module.exports = translate;