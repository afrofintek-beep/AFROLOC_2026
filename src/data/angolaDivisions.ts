// AFROLOC — Divisão administrativa de Angola (província → município → comuna).
//
// FONTES:
// - LUANDA: OFICIAL — Portal do Governo de Angola (governo.gov.ao), verificado
//   2026-06-26. 16 municípios; comunas só onde a fonte confirma. Base completa
//   (com proveniência e estados) em data/admin-base/admin_units.csv.
// - RESTANTES 20 PROVÍNCIAS: ainda legacy/best-effort (pré-reforma) — a migrar
//   para os dados oficiais à medida que forem verificados (mesma fonte oficial).
//
// Estrutura: { "Província": { "Município": ["Comuna", ...] } }
// Lista de comunas vazia = município sem comunas (NÃO se inventam comunas; os
// distritos/localidades são uma camada separada — ver validation_rules.md).

export type ComunaList = string[];
export type Municipios = Record<string, ComunaList>;
export type ProvinceTree = Record<string, Municipios>;

export const ANGOLA: ProvinceTree = {
  // Luanda — OFICIAL (Portal do Governo de Angola · governo.gov.ao · 2026-06-26):
  // 16 municípios. Comunas só onde a fonte oficial confirma; municípios "Sem
  // comunas" ficam sem comuna (os seus distritos/localidades são camada à parte,
  // não comunas). Dados em data/admin-base/admin_units.csv.
  "Luanda": {
    "Luanda": [],
    "Ingombota": [],
    "Maianga": [],
    "Rangel": [],
    "Samba": [],
    "Sambizanga": [],
    "Hoji Ya Henda": [],
    "Cacuaco": ["Cacuaco", "Kikolo"],
    "Cazenga": ["Cazenga", "Kima Kieza"],
    "Viana": ["Calumbo"],
    "Belas": ["Benfica", "Cabolombo", "Barra do Cuanza", "Ramiros"],
    "Talatona": ["Mussulo"],
    "Kilamba": ["Kilamba", "Vila Flôr"],
    "Mussulo": [],
    "Mulenvos": [],
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

/** Comunas de um município (ordenadas). Vazio = município sem comunas (não se
 *  inventam comunas; ver validation_rules.md). Nesse caso o campo é opcional. */
export function comunasOf(province: string | undefined, municipio: string | undefined): string[] {
  if (!province || !municipio || !ANGOLA[province]?.[municipio]) return [];
  return [...ANGOLA[province][municipio]].sort((a, b) => a.localeCompare(b, "pt"));
}
