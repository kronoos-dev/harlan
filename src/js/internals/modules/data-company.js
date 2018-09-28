module.exports = controller => {
    controller.registerCall('data::company', ($company) => 
        ({
            cpf: $company.find('cpf').text(),
            cnpj: $company.find('cnpj').text(),
            nome: $company.find('nome').text(),
            username: $company.find('username').text(),
            responsavel: $company.find('responsavel').text(),
            endereco: [
                $company.find('endereco > endereco:eq(0)').text(),
                $company.find('endereco > endereco:eq(1)').text(),
                $company.find('endereco > endereco:eq(2)').text(),
                $company.find('endereco > endereco:eq(3)').text(),
                $company.find('endereco > endereco:eq(4)').text(),
                $company.find('endereco > endereco:eq(5)').text(),
                $company.find('endereco > endereco:eq(6)').text(),
            ],
        })
    );
};
