module.exports = {
    created_order() {
        const template = `
        <div style="width: 100vw; height: 100vh; background: #2c2c2c; display: flex; flex-direction: row; justify-content: center; align-items: center">
        <div style="width: 300px; height: 300px; background: #fff;">
            <div style="padding: 1rem 2rem;">
                <h4 style="text-align: center; font-weight: bold;">Obrigado por comprar com a SurfArt!</h4>
                <hr style="border-color: #aaa; box-sizing: border-box; width: 100%;" />
                <h5>Pedido concluído com sucesso!</h5>
                <h5 style="font-weight: normal;">Seu pedido foi faturado e em breve será separado para entrega. <br><br> Nos acompanhe nas redes sociais para estar sempre ligado nas novidades
                </h5>
                <img src="./facebook.png" style="width: 2rem; height: 2rem; margin-left: auto; margin-right: auto; display: block;">
            </div>
        </div>
        </div>
        `
        return template;
    },

    recovery(recovery_code) {
        const template = `
        <div style="width: 100vw; height: 100vh; background: #2c2c2c; display: flex; flex-direction: row; justify-content: center; align-items: center">
        <div style="width: 300px; height: 300px; background: #fff;">
            <div style="padding: 1rem 2rem;">
                <h4 style="text-align: center; font-weight: bold;">Recuperação de senha!</h4>
                <hr style="border-color: #aaa; box-sizing: border-box; width: 100%;" />
                <h5>Não compartilhe o seu código!</h5>
                <h5 style="font-weight: normal; text-align: center;">${recovery_code}<br><br> Nos acompanhe nas redes sociais para estar sempre ligado nas novidades
                </h5>
                <img src="./facebook.png" style="width: 2rem; height: 2rem; margin-left: auto; margin-right: auto; display: block;">
            </div>
        </div>
        </div>
        `
        return template;
    }
}