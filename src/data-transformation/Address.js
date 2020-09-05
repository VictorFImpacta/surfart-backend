module.exports = (data) => {
    return {
        cep: data.cep.replace(/\-/g, ''),
        number: data.numero,
        address: data.logradouro,
        complement: data.complemento,
        neighborhood: data.bairro,
        location: data.localidade,
        state: data.uf
    }
};