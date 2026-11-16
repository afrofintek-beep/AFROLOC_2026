type Division={level:number;code:string;name:string;parent_code:string|null};
/** Short code segments can collide; never guess an administrative hierarchy. */
export function resolveDivisions(code:string,divisions:Division[]){
 const parts=code.trim().toUpperCase().split('-');
 if(parts.length!==8||parts[0]!=='AO'||!/^G(10|25|50|100)$/.test(parts[5]))return null;
 const segment=(code:string)=>code.split('-').slice(-1)[0].slice(0,3);
 const matches:{province:Division;municipality:Division;commune?:Division}[]=[];
 for(const province of divisions.filter(d=>d.level===1&&segment(d.code)===parts[1]))
 for(const municipality of divisions.filter(d=>d.level===2&&d.parent_code===province.code&&segment(d.code)===parts[2])){
  const communes=divisions.filter(d=>d.level===3&&d.parent_code===municipality.code);
  if(!communes.length&&parts[3]==='000')matches.push({province,municipality});
  for(const commune of communes.filter(d=>segment(d.code)===parts[3]))matches.push({province,municipality,commune});
 }
 return matches.length===1?matches[0]:null;
}
export function AddressDetails({code,neighborhood,divisions}:{code:string;neighborhood:string;divisions:Division[]}){
 const admin=resolveDivisions(code,divisions);
 return <dl><dt>País</dt><dd>Angola</dd><dt>Província</dt><dd>{admin?.province.name||'Por confirmar'}</dd><dt>Município</dt><dd>{admin?.municipality.name||'Por confirmar'}</dd><dt>Comuna</dt><dd>{admin?admin.commune?.name||'Sem comuna indicada no catálogo':'Por confirmar'}</dd><dt>Bairro / zona declarado</dt><dd>{neighborhood||'Não indicado'}</dd><dt>Complemento do endereço</dt><dd>Não indicado</dd></dl>;
}
