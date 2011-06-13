/* Author: 

*/
;

/**
 * Corrige tamanho da área de conteúdo.
 * 
 * Em geral prefere-se usar uma DIV dentro do conteiner principal
 * para resolver isso. Mas essa solução também estava muito dificil.
 * De qualquerforma como SESSION não pega a área livre mas sim a área
 * do navegador acho que resolver por HTML + CSS é tão gambi quanto
 * por Javascript. Como estou rodando Javascript num ambiente controlado
 * optei por resolver pela Javascript. 
 */
function adjust()
{
	var h = $(window).height();//.document.body
	var h1 = $("body header").height();
	$("#content").height(h-h1-8);
}

/**
 * Mini sistema de template
 * para as entradas
 */

//templete HTML
var template = null;
//lista das variaveis de template
//prestar atenção na ordem de entrada
var templatevars = [
	"$post_name",
	"$post_date",
	"$post_description",
	"$post_link"
];

function initTemplate()
{
	$.ajax({
		url:"entry_template.html",
		success:templateLoaded,
		error:templateError
	});
}

function templateLoaded( content )
{
	template = content;
	//dispara processo das entradas
	getHostData();
	
	//remove loading info
	$("#loaderinit").remove();
}

function templateError( event )
{
	alert(event);
}

// subtrai a primeira imagem que encontra
// no texto
function getImageData( dt )
{
	var rg = /(\&lt\;|\<)img.*(\/\&gt\;|\/\>)/;
	var ob = rg.exec(dt);
	var t = dt.substring(ob.index);
	var imgTag = t.substring(0,t.indexOf(">")+1);
	t = imgTag.substring(imgTag.indexOf("src=\"")+5);
	var src = t.substring(0,t.indexOf("\""));
	return src;
}

// esta função remove a código HTML da string
function getPureText( dt )
{
	while( dt.indexOf("<")>-1)
	{
		var ini = dt.indexOf("<");
		var end = dt.indexOf(">");
		dt = dt.substring(0,ini) + dt.substring(end+1);
	}
	
	return dt;
}

// pega um numero x de palavras
function getMinPalavras(dt)
{
	var p = dt.split(" ");
	var s = "";
	if (p.length<45)
		return dt;
	for (var i=0; i<45; i++)
		s += p[i] + " ";
	return s;
}

// Esta função insere a entrada conforme o template
// recebe um numero de entradas igual ao numero de
// variaveis descritas em templatevars. Se as entradas
// não coincidirem com a ordem das strings em templatevars
// o templeta sera montado errado.
function insertElement()
{
	try
	{
		if (arguments.length!=templatevars.length)
			return; //erro de template
		
		//formata imagem
		var img = "<a href=\"javascript:abrirItem('"+ arguments[3] +"')\" title=\""+ arguments[0] +"\">"+
			"<img src=\"" + 
			getImageData( arguments[2] ) +
			"\" alt=\""+ arguments[0] +"\" width=\"234\" ></a>";
		var text = getPureText( arguments[2]);
		arguments[2] = img + "<p>" + getMinPalavras(text) + "...</p>";
		
		var html = template;
		for(var i=0; i<arguments.length; i++)
		{
			while (true)
			{
				var ini = html.indexOf(templatevars[i]);
				if (ini<0) break;
				
				html = html.substr(0, ini) +
					arguments[i] +
					html.substr( ini + templatevars[i].length);
			}
		}
		$("#content").append(html);
	}
	catch ( e )
	{
		//nada a fazer
	}
	
}


/****
 * Manipula o feed de dados
 * 
 * NOTA: Os dados processados pelo JFeed não leem todos os
 *       links do Feed Atom, então improvisei um mecanismo
 *       de "localização de texto" bem vulgar.
 *       Considere isso uma solução estilo XGH
 * 
 * TODO: Aprimorar o mecanismo de leitura removendo o XGH
 */

/**
 * Chama o feed apartir do feedburner e
 * manda o resultado para t_showItem
 */
function abrirItem( link )
{
	$.ajax(
		{
			url:link,
			success: t_showItem,
			processData: false,
			dataType: "text"
		}
	);
}

/**
 * Pega o textu puro retornado pelo Feed Burner
 * e localiza o link certo.
 */
function t_showItem( entry )
{
	var rg = /\<link rel\=['"]alternate['"].*href\=['"]http\:\/\/www\.rpgvale\.com\.br\//;
	var ob = rg.exec( String(entry) );
	if (ob == null )
		return link;
	
	var p = ob.index + ob[0].length;
	abrir( entry.substring( p-26, entry.indexOf("'", p+1)) );
}

// exibe o feed
function t_showFeed( feed )
{
	for(var i = 0; i < feed.items.length; i++)
	{
		var item = feed.items[i];
		//seguir a orde descrita em templatevars
		insertElement(
			item.title,
			item.updated,
			String(item.description),
			item.link
		);
	}	
}

//erro
function t_error( e )
{
	alert(e);
}

// acessa o servidor
function getHostData()
{
	$.getFeed(
		{
			url:"http://www.rpgvale.com.br/feeds/posts/default",
			data:{format:"xml"},
			success: t_showFeed
		}
	);
}


/**
 * abre a url numa nova tab
 */
function abrir( url )
{
	chrome.tabs.create( {url:url} );
} 


/**
 * Inicializa aplicativo
 */
function init()
{
	setTimeout("timer()",1000);
}

function timer()
{
	initTemplate();
}

$(document).ready( init );

