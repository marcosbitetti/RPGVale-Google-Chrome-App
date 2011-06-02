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
		var img = "<a href=\"\">"+
			"<img src=\"" + 
			getImageData( arguments[2] ) +
			"\" alt=\"\" width=\"234\" ></a>";
		var text = getPureText( arguments[2]);
		arguments[2] = img + "<p>" + getMinPalavras(text) + "...</p>";
		
		var html = template;
		for(var i=0; i<arguments.length; i++)
		{
			var ini = html.indexOf(templatevars[i]);
			html = html.substr(0, ini) +
				arguments[i] +
				html.substr( ini + templatevars[i].length);
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
 */
 
 
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
			String(item.description),//.substring(0,140),
			item.link
		);
	}	
}

//erro
function t_error( e )
{
	//alert(e);
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

