const PHONE = '5516997667944';
const form = document.getElementById('movingForm');
const links = document.querySelectorAll('.js-wa');
const params = new URLSearchParams(location.search);
function getQuote(){
  const data = Object.fromEntries(new FormData(form));
  for (const key in data) data[key] = data[key].trim();
  if (!data.heavyItems || data.heavyItems === 'Não') data.heavyDetails = '';
  return data;
}
function formatDate(value){
  if (!value) return 'a informar';
  const date = new Date(value + 'T12:00:00');
  return date.toLocaleDateString('pt-BR') + ' — ' + date.toLocaleDateString('pt-BR', {weekday:'long'});
}
function quoteSections(data){
  const v = key => data[key] || 'a informar';
  return [
    {title:'DADOS DA MUDANÇA',emoji:'\u{1F4CB}',rows:[['Ajudantes',v('helpers')],['Data',formatDate(data.movingDate)]]},
    {title:'SAÍDA',emoji:'\u{1F4CD}',rows:[['Endereço',v('originAddress')],['Imóvel',v('originType')],['Andar',v('originFloor')],['Acesso',v('originAccess')]]},
    {title:'DESTINO',emoji:'\u{1F3E0}',rows:[['Endereço',v('destinationAddress')],['Imóvel',v('destinationType')],['Andar',v('destinationFloor')],['Acesso',v('destinationAccess')]]},
    {title:'ITENS PARA TRANSPORTAR',emoji:'\u{1F4E6}',rows:[['Itens pesados',v('heavyItems')],...(data.heavyItems && data.heavyItems !== 'Não' ? [['Detalhes dos itens pesados',v('heavyDetails')]] : []),['Móveis e eletrodomésticos',v('furniture')],['Caixas (aproximadamente)',v('boxes')],['Sacos (aproximadamente)',v('bags')]]}
  ];
}
function buildMessage(data = getQuote()){
  const sections = quoteSections(data).map(s => `${s.emoji} *${s.title}*\n${s.rows.map(([label,value]) => `• ${label}: ${value}`).join('\n')}`);
  const campaign = ['utm_source','utm_campaign','utm_content'].filter(k => params.get(k)).map(k => `${k.replace('utm_','')}: ${params.get(k)}`);
  return `Olá! Montei meu pedido pelo site da Schiavon e gostaria de um orçamento de mudança.\n\n${sections.join('\n\n')}\n\nPodem confirmar o valor e a disponibilidade?${campaign.length ? '\n\nOrigem do anúncio: ' + campaign.join(' | ') : ''}`;
}
function buildWa(){return `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(buildMessage())}`;}
function renderQuote(){
  const data = getQuote();
  document.getElementById('heavyDetailsField').hidden = !data.heavyItems || data.heavyItems === 'Não';
  const summary = document.getElementById('movingSummary');
  summary.replaceChildren();
  quoteSections(data).forEach(section => {
    const group = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = section.title;
    group.append(heading);
    section.rows.forEach(([label,value]) => {
      const row = document.createElement('p');
      const title = document.createElement('span');
      const content = document.createElement('strong');
      title.textContent = label; content.textContent = value;
      row.append(title,content); group.append(row);
    });
    summary.append(group);
  });
  const url = buildWa();
  links.forEach(link => {link.href = url;});
}
form.addEventListener('input',renderQuote);
form.addEventListener('change',renderQuote);
form.addEventListener('reset',() => setTimeout(renderQuote,0));
form.addEventListener('submit',event => {event.preventDefault();window.open(buildWa(),'_blank','noopener');});
links.forEach(link => {
  link.target = '_blank'; link.rel = 'noopener'; link.removeAttribute('data-msg');
  link.addEventListener('click',event => {
    if (!form.reportValidity()){event.preventDefault();return;}
    link.href = buildWa();
  });
});
document.getElementById('year').textContent = new Date().getFullYear();
renderQuote();
