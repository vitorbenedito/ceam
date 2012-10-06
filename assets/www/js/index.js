
	/**********************************************************
	 VARIAVEIS
	 **********************************************************/
	
	var itemEditado = null;
	
	var itens = new Array();
	
	var produtosVpsa = new Array();
	
	var entidadesVpsa = new Array();
	
	var carregouProdutosOrganizacao = false;
	
	var carregouProdutosAferimento = false;
	
	var carregouProdutosPesquisa = false;
	
	var urlCeamWeb = "http://ceam.herokuapp.com/";
	
	var urlVpsa = "https://www.vpsa.com.br/apps/api/"; 
	
	var validouSenha = false;
	
	var APP_ID = "50532b96d93a4b7a7c000002"
	var APP_SECRET = "9b5211aabfe615db0c35d6e2a25e33a39aea0991fc44b3760926cdb97ad651f3"
	var VPSA_AUTHORIZATION_URL = "https://www.vpsa.com.br/apps/oauth/authorization"
	var VPSA_TOKEN_URL = "https://www.vpsa.com.br/apps/oauth/token"
	var VPSA_REDIRECT_URI = "http://localhost:3000/oauth/callback"
		
	var token = null;
	
	//var urlCeamWeb = "http://10.0.2.2:3000/";
	
	/**********************************************************
	 ACTIONS
	 **********************************************************/
	
	$(document).ready(validaToken);
	
	function url_vpsa( api_vpsa,entidades )
	{
		return urlVpsa + api_vpsa + '?token=' + this.token + '&entidades=' + entidades;
	}
	
	function url_vpsa( api_vpsa )
	{
		return urlVpsa + api_vpsa + '?token=' + this.token;
	}
	
	function validaToken()
	{
		if(token == null)
		{
			$.mobile.changePage( "#login", { transition: "slideup"} );
			return;
		}
		else
		{
			executarComandos();
		}
	}

	
	function executarComandos()
	{
		
		this.itens = [];
		
		carregarEntidadesVpsa();
		
		carregarProdutosVpsa();
		
		$('#footerSenha').hide();
		
		$('#buttonLocaliza').click(function() {
			carregaLocalizacoes();
		});
		
		$('#buttonScanner').click(function() {
			carregarComboLocalizacao();
		});
		
		$('#cadastrar').click(function(){
			cadastrarLocalizacao();
		});
		
		$('#scannerOrganizacaoButton').click(function(){
			scanearOrganizacao();
		});
		
		$('#scannerBalancoInventario').click(function(){
			scannerBalancoInventario();
		});
		
		$('#salvarOrganizacao').click(function(){
			salvarOrganizacao();
		});
		
		$('#salvarBalancoInventario').click(function(){
			salvarBalancoInventario();
		});
		
		$('#pesquisarProdutosButton').click(function(){
			carregarProdutosVpsaOrganizacao();
		});
		
		$('#pesquisarProdutosAferimentoButton').click(function(){
			carregarProdutosVpsaAferimento();
		});
		
		$('#buttonPesquisaProdutos').click(function(){
			carregarProdutosVpsaPesquisa();
		});
		
		$('#buttonCancelar').click(function(){
			$("#aferirEstoque").dialog("close");
		});
		
		$.mobile.changePage( "#home", { transition: "slideup"} );
	}
	
	function logar()
	{
		
		 var childBrowser = window.plugins.childBrowser;
		
		 childBrowser.showWebPage(VPSA_AUTHORIZATION_URL + '?response_type=code&app_id='+APP_ID+'&redirect_uri='+VPSA_REDIRECT_URI, { showLocationBar: false });
		
		childBrowser.onLocationChange = function(loc) {
	        if (loc.indexOf('callback?code=') > -1) {
	           
	            var code = loc.substr( loc.indexOf('code=') + 5, loc.length - 1);

	            getAccessToken(code);
	        }
	    };
	}
	
	function getAccessToken(code) {
		
		var json = JSON.stringify( {grant_type: "authorization_code",app_id: APP_ID, app_secret:APP_SECRET,redirect_uri:VPSA_REDIRECT_URI,code:code});
		
		var request = $.ajax({
			  type: "POST",
			  url: VPSA_TOKEN_URL,
			  data: json,
			  contentType: "application/json"
			});
		
		request.done(function(data) {
			  registrarToken(data);
			});

			request.fail(function(jqXHR, textStatus) {
			  alert(textStatus);
			});

	}
	
	function registrarToken(data)
	{
		window.plugins.childBrowser.close();
		token = data['access_token'];
		executarComandos();
	}
	
	/**********************************************************
	 CARREGA DADOS DO VPSA
	 **********************************************************/
	
	function carregarProdutosVpsa()
	{
		
		if( produtosVpsa == null || produtosVpsa.length == 0 )
		{
		
			$.getJSON( urlCeamWeb + 'produtos.json', 
		  			function(data) {
		  				$.each(data, function(key, val) {
		  					produtosVpsa[val.id] = val;
		  			});
		  				
			});
		}
		
	}
	
	function carregarEntidadesVpsa()
	{
		
		if( entidadesVpsa == null || entidadesVpsa.length == 0 )
		{
			
			$.getJSON( url_vpsa( 'entidades' ), 
		  			function(data) {
				
						var combo = $('#comboEntidades');
						combo.html('');
						var combos = "";
				
		  				$.each(data, function(key, val) {
		  					
		  					entidadesVpsa[val.id] = val;

		  			        combos = combos + "<option value='" + val.id + "' >" + val.nome + "</option>"; 
		  					
		  				});
		  				
		  				combo.append(combos);
	  			        combo.selectmenu('refresh');
			});
		}
		
	}
	
	function getEntidadeSelecionada()
	{
		return $('#comboLocalizacao').val();
	}
	
	/**********************************************************
	 LOCALIZAÇÃO
	 **********************************************************/
	function carregaLocalizacoes(){
		
		$.getJSON( urlCeamWeb + 'localizacaos.json', 
	  		function(data) {

	  			var list = $('#listLocalizacao');
	  			list.html("");
	  			$.each(data, function(key, val) {
	  				    
	  				var html ='<a href="#detalheLocalizacao" data-rel="dialog" data-transition="pop" onclick="loadProdutos(' + val.id + ');" ><b>' + val.descricao + '</b></a> ';
	  					 
	    			list.append(
	    					$(document.createElement('li')).html(html)
	    			);
	    				
	  			});
	 
	  			list.listview("destroy").listview();
	  			
			});
		
	}
	
	function loadProdutos(id)
	{
		
		var list = $('#listDetalheLocalizacao');
		list.html("");
		list.append(
			$(document.createElement('li')).html("carregando...")
		);
		
		$.getJSON( urlCeamWeb + 'localizacaos/loadprodutos/' + id + '.json', 
	  		function(data) {
				list.html("");
	  			$.each(data, function(key, val) {

	  				var produto = produtosVpsa[val.idProduto];
	  			  		
	  		    	list.append(
	  		      		$(document.createElement('li')).html(produto.descricao)
	  		    	);
	    				
	  			});
	  				
	  			list.listview("refresh");
	  				
			});
		
	}
	
	function carregarComboLocalizacao(){
		
		$.getJSON( urlCeamWeb + 'localizacaos.json', 
	  		function(data) {
					
			 	var combo = $('#comboLocalizacao');
			 	combo.html('');
				var combos = "";
		        $.each(data, function(key, val){
		            combos = combos + "<option value='" + val.id + "' >" + val.descricao + "</option>";
		        }); 

		        combo.append(combos);
		        combo.selectmenu('refresh');

			}); 
	
	}
	
	function cadastrarLocalizacao(){

		 var desc = $('#descricao').val();
		
		 if(desc == '')
		 {
			alert('Informe um nome para a localização');
			return;
		 }
	
		 $.post( urlCeamWeb + 'localizacaos', {"localizacao[descricao]": desc}, function(data){
			 carregaLocalizacoes();
		   },"html"
		  );
		 
		 $('#descricao').val('');
		 
		 carregaLocalizacoes();
		  
		 alert('Registro salvo com sucesso !');
		
	}
	
	/**********************************************************
	 ORGANIZAÇÃO
	 **********************************************************/
	
	function carregarProdutosVpsaOrganizacao(){
		
		
		if(!carregouProdutosOrganizacao)
		{
			carregarProdutos("insereProdutoOrganizacao",carregouProdutosOrganizacao,"#listProdutos");
			carregouProdutosOrganizacao = true;
		}
	
	}
	
	function salvarOrganizacao(){
		
		var localizacao =  $('#comboLocalizacao').val();
		
		for(i=0;i<itens.length;i++){
		
			 var value = itens[i+1];
			 if(value != undefined){
				
				 $.post( urlCeamWeb + 'produtos', {"produto[idProduto]": value.id,"produto[localizacao_id]": localizacao}, function(data){
				
				   },"html"
				  ); // Fim do POST
		 	 }
			 
		}
		
		carregouProdutosOrganizacao = false;
		
		carregouProdutosAferimento = false;
		
		carregouProdutosPesquisa = false;
		
		$('#listCodigos').empty();
		itens = new Array();
		itemEditado = null;
		
		alert('Registro salvo com sucesso !');
		
	}
	
	function scanearOrganizacao(){
		
		 window.plugins.barcodeScanner.scan( function(result) { 
			
			 if(result != null && result.text != '')
			 {
				scanearOrganizacao();
			 	insereProdutoOrganizacao(result.text);
			 }
	        
	        }, function(error) {
	        alert("Scanning failed: " + error);
	    }  
		);   
		
	}
	
	function insereProdutoOrganizacao(id)
	{
		
		var data = produtosVpsa[id];
		
		if(data == null || data == undefined || data.id == null)
		{
			alert('Produto não encontrado.');
			return;
		}
					
		if(itens[data.id] != null)
		{
			alert('Produto já inserido.');
			return;
		}
					
	    var list = $('#listCodigos');
							
		var html = '<a>' + data.descricao + '</a>';
		html += '<a onclick="excluirLinha( '+ data.id +' );">Excluir</a>';
		list.append(
				 $(document.createElement('li')).attr('id','licount_'+data.id).html( html )
		);
							
		list.listview("refresh");
		
		itens[data.id] = data;
						
		
	}
	
	/**********************************************************
	 BALANÇO INVENTÁRIO
	 **********************************************************/
	
	function carregarProdutosVpsaAferimento(){
		if(!carregouProdutosAferimento)
		{
			carregarProdutos("insereProdutoAferimento",carregouProdutosAferimento,"#listProdutosAferimento");
			carregouProdutosAferimento = true;
		}
	}
	
	function scannerBalancoInventario(){
		
		 window.plugins.barcodeScanner.scan( function(result) { 
			if(result != null && result.text != '')
			{
				
				if(IsNumeric(result.text))
				{
					scannerBalancoInventario();
					insereProdutoAferimento(result.text);
				}
				else
				{ 
					insereProdutosPorLocalizacao(result.text);
				 }
			}
			
	    }, function(error) {
	        alert("Scanning failed: " + error);
	    }  
		); 
		
	}
	
	function insereProdutoAferimento(id)
	{
		
		var data = produtosVpsa[id];
						
		if(data == null || data == undefined || data.id == null)
		{
			alert('Produto não encontrado.');
			return;
		}
						
		if(itens[data.id] != null)
		{
			alert('Produto já inserido.');
			return;
		}
						
		var list = $('#listBalancoInventario');

		var html ='<a href="#aferirEstoque" onclick="setarItemEditado('+data.id+')" data-rel="dialog" data-transition="pop">' + data.descricao + '</a> ';
		html += '<a onclick="excluirLinha( '+ data.id +' );">Excluir</a>';
		
		list.append( $(document.createElement('li')).attr('id','licount_'+data.id).html( html ) );
		
		list.listview("destroy").listview();
		
		data.qtdeAferida = 0;
		
		itens[data.id] = data;
		
	}
	
	function insereProdutosPorLocalizacao(text)
	{
		$.getJSON( urlCeamWeb + 'localizacaos/find/'+text+'.json', 
	  			function(data) {
				
				var list = $('#listBalancoInventario');
					
				$.each(data, function(key, val) {
					
					var produto = produtosVpsa[val.idProduto];
					
					var html ='<a href="#aferirEstoque" onclick="setarItemEditado('+produto.id+')" data-rel="dialog" data-transition="pop">' + produto.descricao + '</a> ';
					html += '<a onclick="excluirLinha( '+ produto.id +' );">Excluir</a>';
					
					list.append( $(document.createElement('li')).attr('id','licount_'+produto.id).html( html ));
			
					itens[produto.id] = produto;
				})
				
				list.listview("refresh");

		});
	}
	
	function inserirQuantidadeAferida()
	{
		var qtde = $("#qtdeAferida").val();
		var existeCount = $("#count_" + itemEditado.id);
		
		if(existeCount[0] != undefined)
		{
			$("#count_" + itemEditado.id).html(qtde + '');
		}
		else
		{
			$("#licount_" + itemEditado.id).append('<span class="ui-li-count" id="count_'+ itemEditado.id +'">'+qtde+'</span>');
		}
		
		$("#aferirEstoque").dialog("close");
		$('#listBalancoInventario').listview("destroy").listview();
		itemEditado.qtdeAferida = qtde;
		$("#qtdeAferida").val('');
	}
	
	function salvarBalancoInventario(){
		
		var nomeBalanco =  $('#nomeBalanco').val();
		
		if(nomeBalanco == '')
		{
			alert("Informe um nome para o balanço de inventário");	
			return;
		}
		
		if(!validouSenha)
		{
			var encontrouErro = false;
			
			for(i=0;i<itens.length;i++){
				
				 var value = itens[i+1];
				 
				 if(value != undefined){
			
					if(value.qtdeAferida != value.quantidadeEmEstoque)
					 {
						$("#count_" + value.id).attr('class','ui-li-count ui-btn-up-e');
						encontrouErro = true;
					 }
					else
					{
						$("#count_" + value.id).attr('class','ui-li-count ui-btn-up-b');
					}
				 }
			}
			
			if(encontrouErro)
			{
				$('#listBalancoInventario').listview('refresh');
				$('#footerSenha').hide('slow', function() {
				    // Animation complete.
				  });
				$('#footerSenha').show('slow', function() {
				    // Animation complete.
				  });
				return;
			}
		}
		
		var produtosAferidos = new Array();
		
		var count = 0;
		
		for(i=0;i<itens.length;i++){
			
			 var value = itens[i+1];
			 
			 if(value != undefined){
				 
				 produtosAferidos[count] = {idProduto: value.id,qtdeAferida:value.qtdeAferida, qtdeEstoque: value.quantidadeEmEstoque};
				 
				 count++;
 
			 }
		}
		
		var balancoJson = { "balanco[nome]": nomeBalanco, "balanco[produto_aferidos_attributes]": produtosAferidos };
					
		$.post( urlCeamWeb + 'balancos.json', balancoJson, function(data){
				   /* alert(data) */
				   		
				   
			},"json"
		); // Fim do POST
		
		$('#nomeBalanco').val("");
		
		for(i=0;i<itens.length;i++){
			 var value = itens[i+1];
			 
			 if(value != undefined){
				 var value = itens[i+1];
			 	value.qtdeAferida = 0;
			 }
		}
		
		itens = new Array();
		itemEditado = null;
		$('#listBalancoInventario').empty();
		
		if(validouSenha == true)
		{
			validouSenha = false;
		}
		
		$('#footerSenha').hide();
		
		alert('Registro salvo com sucesso !');
			 
	}
	
	function changeValidarSenha()
	{
		$.mobile.changePage( "#divSenha", { transition: "slideup"} );
	}
	
	
	function validarSenha()
	{
		var senha = $('#senha').val();
		
		if(senha == 'vpsa')
		{
			validouSenha = true;
			$('#footerSenha').hide();
			$.mobile.changePage( "#divBalancoInventario", { transition: "slideup"} );
		}
		else
		{
			alert('Senha incorreta');
		}
	}
	
	/**********************************************************
	 PESQUISA PRODUTOS
	 **********************************************************/
	
	function carregarProdutosVpsaPesquisa(){
		if(!carregouProdutosPesquisa)
		{
			carregarProdutos("detalheBalancoProduto",carregouProdutosOrganizacao,"#listPesquisaProdutos");
			carregouProdutosPesquisa = true;
		}
	}
	
	/**********************************************************
	 FUNÇÕES EM COMUM
	 **********************************************************/
	
	function carregarProdutos(metodo,carregou,idList)
	{
		
		var list = $(idList);
		list.html("");
		
		list.append( $(document.createElement('li')).html("carregando...") );
		
		var produtosComLocalizacao = new Array();
		
		$.getJSON( urlCeamWeb + 'localizacaos.json', 
				function(data) {
			
				list.html("");
				
				$.each(data, function(key, valLocalizacao) {
					
					if(valLocalizacao.produtos != null && valLocalizacao.produtos.length > 0){
	  					
	  					
	  					var html = valLocalizacao.descricao;
	  					
	  					list.append( $(document.createElement('li')).attr('data-role','list-divider').html(html) );
	  					
	  					$.each(valLocalizacao.produtos, function(key, valProduto) {
	  						
	  						 var produto = produtosVpsa[valProduto.idProduto];
	  						
		  					 var html ='<a onclick="'+metodo+'(' + valProduto.idProduto + ');" >' + produto.descricao + '</a> ';
		  					 
		    				 list.append( $(document.createElement('li')).html(html) );
		    				 
		    				 produtosComLocalizacao[valProduto.idProduto] = valProduto;
		    				 
	  					});
  					}
					
			});
				
			list.append( $(document.createElement('li')).attr('data-role','list-divider').html("Produtos sem localiza&ccedil;&atilde;o") );
			var count = 0;
			for(i=0;i<produtosVpsa.length;i++)
			{
				var produtoVpsa = produtosVpsa[i+1];
					 
				if(produtoVpsa != undefined && produtosComLocalizacao[produtoVpsa.id] == undefined){
						 
					var html ='<a onclick="'+metodo+'(' + produtoVpsa.id + ');" ><b>' + produtoVpsa.descricao + '</b></a> ';
							 
					list.append( $(document.createElement('li')).html(html) );
						 
					count++;
						 
				}

				if(count == 10)
				{
					break;
				}
			} 
			
			list.listview("refresh");
				
		});
		
		
	}
	
	function setarItemEditado(id)
	{
		itemEditado = itens[id];
		
		$("#h3ProdutoAferido").html(itemEditado.descricao);
		
		if(itemEditado != null && itemEditado.qtdeAferida != null)
		{
			$("#qtdeAferida").val(itemEditado.qtdeAferida);
		}
	}
	
	function excluirLinha(id)
	{
		$("#licount_" + id).remove();
		itens[id] = null;
	}
	
	function IsNumeric(input){
	    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
	    return (RE.test(input));
	}
	
