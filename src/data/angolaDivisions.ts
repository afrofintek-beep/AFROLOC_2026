// AFROLOC — Divisão administrativa de Angola (província → município → comuna).
//
// ⚠️ DADOS PARA VERIFICAÇÃO. Carregados em best-effort, alinhados com a nova
// Divisão Político-Administrativa (21 províncias). Os MUNICÍPIOS estão sólidos;
// alguns COMUNAS podem precisar de correção. Edita livremente este ficheiro —
// a app lê daqui e os menus em cascata atualizam-se automaticamente.
//
// Estrutura: { "Província": { "Município": ["Comuna", ...] } }
// Se um município não tiver comunas conhecidas, usa-se ["Sede"] como omissão.

export type ComunaList = string[];
export type Municipios = Record<string, ComunaList>;
export type ProvinceTree = Record<string, Municipios>;

export const ANGOLA: ProvinceTree = {
  // Luanda — 13 municípios confirmados (Lei 14/24, reforma 2024). Comunas
  // best-effort; municípios sem comuna confirmada mostram "Sede" até revisão.
  "Luanda": {
    "Ingombota": [],
    "Maianga": [],
    "Rangel": [],
    "Samba": [],
    "Sambizanga": [],
    "Cacuaco": ["Cacuaco", "Funda", "Kikolo", "Kiluanji"],
    "Cazenga": ["Cazenga", "Hoji ya Henda", "Tala Hady"],
    "Viana": ["Viana", "Calumbo", "Zango", "Mbaia"],
    "Belas": ["Belas", "Benfica", "Ramiros", "Barra do Kwanza", "Quenguela"],
    "Kilamba Kiaxi": ["Golfe", "Palanca", "Sapu", "Vila Estoril"],
    "Talatona": ["Talatona", "Futungo de Belas", "Quificas"],
    "Mussulo": [],
    "Camama": [],
  },
  "Icolo e Bengo": {
    "Icolo e Bengo": ["Catete", "Bom Jesus", "Cabiri", "Quingenge", "Cassoneca"],
    "Quiçama": ["Muxima", "Demba Chio", "Cabo Ledo", "Quixinge"],
  },
  "Bengo": {
    "Caxito": ["Caxito", "Úcua", "Mabubas"],
    "Dande": ["Dande", "Barra do Dande", "Quicabo", "Mazozo"],
    "Ambriz": ["Ambriz", "Tabi", "Bela Vista"],
    "Bula Atumba": ["Bula Atumba", "Quibaxe", "Gonguembo"],
    "Dembos": ["Dembos", "Paredes", "Quiage"],
    "Nambuangongo": ["Nambuangongo", "Canacassala", "Gombe", "Quicunzo", "Zala"],
    "Pango Aluquém": ["Pango Aluquém", "Cazuangongo"],
  },
  "Benguela": {
    "Benguela": ["Benguela", "Baía Farta", "Caiave", "Catumbela"],
    "Lobito": ["Lobito", "Canjala", "Catengue", "Egito Praia"],
    "Catumbela": ["Catumbela", "Cavaco", "Praia Bonita"],
    "Cubal": ["Cubal", "Capupa", "Tumbulo", "Yambala"],
    "Ganda": ["Ganda", "Babaera", "Casseque", "Chikuma", "Ebanga"],
    "Balombo": ["Balombo", "Chindumbo", "Chingongo", "Maca-Mombolo"],
    "Bocoio": ["Bocoio", "Cubal do Lumbo", "Monte Belo", "Passe"],
    "Caimbambo": ["Caimbambo", "Catengue", "Wau-Kungo"],
    "Chongoroi": ["Chongoroi", "Bolonguera"],
  },
  "Bié": {
    "Cuíto": ["Cuíto", "Trumba", "Cunje", "Chicala", "Belo Horizonte"],
    "Andulo": ["Andulo", "Calussinga", "Cassumbe"],
    "Camacupa": ["Camacupa", "Cangote", "Cuanza", "Mussende", "Umpulo"],
    "Catabola": ["Catabola", "Caiei", "Chiuca", "Sande"],
    "Chinguar": ["Chinguar", "Cangote", "Kutato"],
    "Chitembo": ["Chitembo", "Catabola", "Malengue", "Mumbué"],
    "Cunhinga": ["Cunhinga", "Belo Horizonte", "Cambândua"],
    "Cuemba": ["Cuemba", "Cangote", "Lúbia", "Munhango"],
    "Nharea": ["Nharea", "Calenga", "Dando"],
  },
  "Cabinda": {
    "Cabinda": ["Cabinda", "Tando Zinze", "Malembo"],
    "Belize": ["Belize", "Luali", "Miconje"],
    "Buco-Zau": ["Buco-Zau", "Inhuca", "Necuto"],
    "Cacongo": ["Lândana", "Massabi", "Dinge"],
  },
  "Cuando": {
    "Mavinga": ["Mavinga", "Cunjamba", "Luengue", "Luiana"],
    "Nancova": ["Nancova", "Rito"],
    "Rivungo": ["Rivungo", "Luiana", "Xamavera"],
    "Dirico": ["Dirico", "Mucusso", "Xamavera"],
  },
  "Cubango": {
    "Menongue": ["Menongue", "Caiundo", "Cueio", "Missombo"],
    "Calai": ["Calai", "Maué"],
    "Cuangar": ["Cuangar", "Bondo", "Savate"],
    "Cuchi": ["Cuchi", "Chinguanja", "Vissati"],
    "Cuito Cuanavale": ["Cuito Cuanavale", "Baixo Longa", "Longa", "Lupire"],
  },
  "Cuanza Norte": {
    "Cazengo": ["N'dalatando", "Lucala", "Canhoca"],
    "Ambaca": ["Camabatela", "Aldeia Nova", "Bindo", "Luinga"],
    "Banga": ["Banga", "Caículo", "Tango"],
    "Bolongongo": ["Bolongongo", "Quiculungo", "Terreiro"],
    "Cambambe": ["Dondo", "Massangano", "Zenza do Itombe"],
    "Golungo Alto": ["Golungo Alto", "Cerca", "Quia", "Quibango"],
    "Gonguembo": ["Cangulo", "Cabondo", "Camame"],
    "Lucala": ["Lucala", "Aldeia Nova", "Quiapeça"],
    "Quiculungo": ["Quiculungo", "Bolongongo"],
    "Samba Cajú": ["Samba Cajú", "Camême", "Quiluange"],
  },
  "Cuanza Sul": {
    "Sumbe": ["Sumbe", "Gangula", "Quicombo", "Gunza"],
    "Amboim": ["Gabela", "Assango", "Gungo"],
    "Cassongue": ["Cassongue", "Atome", "Dumbi", "Pambangala"],
    "Conda": ["Conda", "Cachombo", "Gungo"],
    "Ebo": ["Ebo", "Canjombe", "Vamba"],
    "Libolo": ["Calulo", "Munenga", "Quissongo"],
    "Mussende": ["Mussende", "Quienha", "São Lucas"],
    "Porto Amboim": ["Porto Amboim", "Capolo", "Quissongo"],
    "Quibala": ["Quibala", "Cariango", "Lonhe", "Dala Cachibo"],
    "Quilenda": ["Quilenda", "Botera", "Euca"],
    "Seles": ["Uku Seles", "Quissongo", "Bindo"],
    "Waku Kungo": ["Waku Kungo", "Sanga", "Cassote"],
  },
  "Cunene": {
    "Cuanhama": ["Ondjiva", "Môngua", "Nehone", "Evale"],
    "Cahama": ["Cahama", "Otchinjau", "Mucope"],
    "Cuvelai": ["Cuvelai", "Calonga", "Mupa"],
    "Curoca": ["Oncócua", "Chitado", "Otchinjau"],
    "Namacunde": ["Namacunde", "Chiede", "Humbe"],
    "Ombadja": ["Xangongo", "Humbe", "Naulila", "Mucope"],
  },
  "Huambo": {
    "Huambo": ["Huambo", "Calima", "Chipipa"],
    "Bailundo": ["Bailundo", "Bimbe", "Hengue", "Luvemba", "Lunge"],
    "Caála": ["Caála", "Calenga", "Cuima"],
    "Catchiungo": ["Catchiungo", "Chinhama", "Sambo"],
    "Ekunha": ["Ekunha", "Cuima"],
    "Londuimbali": ["Londuimbali", "Alto Hama", "Galanga", "Ussoque"],
    "Longonjo": ["Longonjo", "Lepi", "Iva", "Chicava"],
    "Mungo": ["Mungo", "Cangote"],
    "Tchicala-Tcholohanga": ["Tchicala-Tcholohanga", "Samboto"],
    "Tchindjenje": ["Tchindjenje", "Viye"],
    "Ucuma": ["Ucuma", "Cuima"],
  },
  "Huíla": {
    "Lubango": ["Lubango", "Arimba", "Hoque", "Huíla"],
    "Caconda": ["Caconda", "Cusse", "Gungue"],
    "Cacula": ["Cacula", "Chituto", "Viti-Vivali"],
    "Caluquembe": ["Caluquembe", "Calepi", "Ngola"],
    "Chibia": ["Chibia", "Capunda", "Jau", "Quihita"],
    "Chicomba": ["Chicomba", "Cutenda", "Mucundi"],
    "Chipindo": ["Chipindo", "Bambi", "Galangue"],
    "Cuvango": ["Cuvango", "Galangue", "Vissati"],
    "Gambos": ["Chiange", "Chibemba"],
    "Humpata": ["Humpata", "Palanca", "Neves"],
    "Jamba": ["Jamba", "Cassinga", "Dongo"],
    "Matala": ["Matala", "Capelongo", "Mulondo"],
    "Quilengues": ["Quilengues", "Dinde", "Impulo"],
    "Quipungo": ["Quipungo", "Cainda", "Ngovi"],
  },
  "Lunda Norte": {
    "Chitato": ["Dundo", "Luachimo", "Camaxilo"],
    "Cambulo": ["Cambulo", "Canzar", "Luia"],
    "Capenda-Camulemba": ["Capenda-Camulemba", "Xinge"],
    "Caungula": ["Caungula", "Camaxilo"],
    "Cuango": ["Cuango", "Luremo"],
    "Cuilo": ["Cuilo", "Caluango"],
    "Lóvua": ["Lóvua", "Camatambo"],
    "Lubalo": ["Lubalo", "Cassanje-Calucala"],
    "Lucapa": ["Lucapa", "Camissombo", "Xá-Muteba"],
    "Xá-Muteba": ["Xá-Muteba", "Camissombo"],
  },
  "Lunda Sul": {
    "Saurimo": ["Saurimo", "Mona Quimbundo", "Sombo"],
    "Cacolo": ["Cacolo", "Alto Chicapa", "Cucumbi", "Xassengue"],
    "Dala": ["Dala", "Caluango", "Mona Quimbundo"],
    "Muconda": ["Muconda", "Cassai-Sul", "Chiluage"],
  },
  "Malanje": {
    "Malanje": ["Malanje", "Cambaxe", "Ngola Luíje"],
    "Cacuso": ["Cacuso", "Lombe", "Pungo Andongo", "Soqueco"],
    "Calandula": ["Calandula", "Cahombo", "Cateco Cangola", "Kota", "Quizenga"],
    "Cambundi-Catembo": ["Cambundi-Catembo", "Dombo", "Quitapa"],
    "Cangandala": ["Cangandala", "Bembo", "Caribo", "Cunjo"],
    "Caombo": ["Caombo", "Dumbo"],
    "Cuaba Nzogo": ["Cuaba Nzogo", "Cunda-Dia-Baze"],
    "Cunda-Dia-Baze": ["Cunda-Dia-Baze", "Camba"],
    "Luquembo": ["Luquembo", "Cassuango", "Quinge"],
    "Marimba": ["Marimba", "Cahombo", "Gondamba"],
    "Massango": ["Massango", "Quihuhu"],
    "Mucari": ["Mucari", "Bângalas"],
    "Quela": ["Quela", "Bângalas", "Xandel"],
    "Quirima": ["Quirima", "Saúde"],
  },
  "Moxico": {
    "Luena": ["Luena", "Cangumbe", "Lucusse", "Muangai"],
    "Camanongue": ["Camanongue", "Cassamba"],
    "Léua": ["Léua", "Caianda"],
    "Luchazes": ["Cangamba", "Lutembo", "Muié"],
    "Bundas": ["Lumbala N'guimbo", "Lutembo", "Mussuma", "Ninda"],
  },
  "Moxico Leste": {
    "Alto Zambeze": ["Cazombo", "Calunda", "Macondo", "Nana-Candundo"],
    "Luau": ["Luau", "Caianda", "Lóvua"],
    "Cameia": ["Cameia", "Lóvua", "Muziva"],
  },
  "Namibe": {
    "Moçâmedes": ["Moçâmedes", "Bentiaba", "Forte Câmara"],
    "Bibala": ["Bibala", "Cainde", "Lola"],
    "Camucuio": ["Camucuio", "Chingo", "Mamué"],
    "Tômbwa": ["Tômbwa", "Baía dos Tigres"],
    "Virei": ["Virei", "Lola"],
  },
  "Uíge": {
    "Uíge": ["Uíge", "Candal", "Cazenga"],
    "Negage": ["Negage", "Dimuca", "Quissaca"],
    "Ambuíla": ["Ambuíla", "Camatambo"],
    "Alto Cauale": ["Alto Cauale", "Quitumbo"],
    "Bembe": ["Bembe", "Lucunga"],
    "Buengas": ["Buengas", "Cambamba"],
    "Bungo": ["Bungo", "Cambongo"],
    "Damba": ["Damba", "Lemboa", "Petecusso"],
    "Macocola": ["Macocola", "Bengo"],
    "Mucaba": ["Mucaba", "Uando"],
    "Puri": ["Puri", "Quipedro"],
    "Quimbele": ["Quimbele", "Alfândega", "Cuango"],
    "Quitexe": ["Quitexe", "Aldeia Viçosa", "Vista Alegre"],
    "Sanza Pombo": ["Sanza Pombo", "Cuilo Futa", "Uamba"],
    "Songo": ["Songo", "Tembo Aluma"],
    "Maquela do Zombo": ["Maquela do Zombo", "Béu", "Cuilo Futa", "Quibocolo"],
  },
  "Zaire": {
    "M'banza Kongo": ["M'banza Kongo", "Caluca", "Luvo"],
    "Soyo": ["Soyo", "Kelo", "Mangue Grande", "Pedra do Feitiço"],
    "N'zeto": ["N'zeto", "Kindeje", "Musserra"],
    "Cuimba": ["Cuimba", "Buela", "Luvo", "Sacandica"],
    "Noqui": ["Noqui", "Lufico", "Mpala"],
    "Tomboco": ["Tomboco", "Kinzau", "Quiende"],
  },
};

/** Lista de províncias (ordenada). */
export function provinces(): string[] {
  return Object.keys(ANGOLA).sort((a, b) => a.localeCompare(b, "pt"));
}

/** Municípios de uma província (ordenados). */
export function municipiosOf(province: string | undefined): string[] {
  if (!province || !ANGOLA[province]) return [];
  return Object.keys(ANGOLA[province]).sort((a, b) => a.localeCompare(b, "pt"));
}

/** Comunas de um município (ordenadas); ["Sede"] como omissão. */
export function comunasOf(province: string | undefined, municipio: string | undefined): string[] {
  if (!province || !municipio || !ANGOLA[province]?.[municipio]) return [];
  const list = ANGOLA[province][municipio];
  return list.length ? [...list].sort((a, b) => a.localeCompare(b, "pt")) : ["Sede"];
}
