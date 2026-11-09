/* Printed-bulletin language: section headings, fixed labels and date formats.
   Add a language by copying one block below. Scripture inserted from the built-in
   Berean Standard Bible stays in English; type or paste another translation into the section. */
const LANGS={
en:{n:"English",loc:"en-US",welcome:"Welcome",order:"Order of service",sermon:"Sermon",announce:"Announcements",events:"Coming up",prayer:"Prayer requests",giving:"Giving",connect:"Next steps",notes:"Notes",join:"Join us",scan:"Scan to visit",lords:"Lord’s Day",worship:"Sunday Worship"},
es:{n:"Español",loc:"es-US",welcome:"Bienvenida",order:"Orden del servicio",sermon:"Sermón",announce:"Anuncios",events:"Próximos eventos",prayer:"Peticiones de oración",giving:"Ofrendas",connect:"Próximos pasos",notes:"Notas",join:"Acompáñenos",scan:"Escanee para visitar",lords:"Día del Señor",worship:"Culto dominical"},
fr:{n:"Français",loc:"fr-FR",welcome:"Bienvenue",order:"Ordre du culte",sermon:"Prédication",announce:"Annonces",events:"À venir",prayer:"Sujets de prière",giving:"Offrandes",connect:"Prochaines étapes",notes:"Notes",join:"Nous rejoindre",scan:"Scannez pour visiter",lords:"Jour du Seigneur",worship:"Culte du dimanche"},
pt:{n:"Português",loc:"pt-BR",welcome:"Boas-vindas",order:"Ordem do culto",sermon:"Sermão",announce:"Avisos",events:"Próximos eventos",prayer:"Pedidos de oração",giving:"Ofertas",connect:"Próximos passos",notes:"Anotações",join:"Visite-nos",scan:"Escaneie para visitar",lords:"Dia do Senhor",worship:"Culto de domingo"},
de:{n:"Deutsch",loc:"de-DE",welcome:"Willkommen",order:"Ablauf des Gottesdienstes",sermon:"Predigt",announce:"Ankündigungen",events:"Termine",prayer:"Gebetsanliegen",giving:"Gaben",connect:"Nächste Schritte",notes:"Notizen",join:"Besuchen Sie uns",scan:"Scannen und besuchen",lords:"Tag des Herrn",worship:"Sonntagsgottesdienst"}
};
const lang=()=>LANGS[(typeof DB!="undefined"&&DB.l&&DB.l.lang)||"en"]||LANGS.en;
const tr=k=>lang()[k]||LANGS.en[k]||k;
const dloc=()=>lang().loc;
