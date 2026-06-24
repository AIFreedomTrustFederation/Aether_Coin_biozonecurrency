const state = { user: null, data: null, options: null };
const $ = (id) => document.getElementById(id);
const qs = (sel, root=document) => root.querySelector(sel);
const qsa = (sel, root=document) => [...root.querySelectorAll(sel)];

async function api(path, options={}){
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const res = await fetch(path, { credentials:'include', ...options, headers: { ...headers, ...(options.headers||{}) }});
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if(!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

function route(name){
  qsa('.view').forEach(v => v.classList.remove('active'));
  const target = $(name) || $('landing');
  target.classList.add('active');
  if(name === 'packet') renderPacket();
  window.location.hash = name;
}

function showMessage(msg){ $('authMessage').textContent = msg || ''; }
function fillSelect(el, values){ el.innerHTML = values.map(v => `<option>${escapeHtml(v)}</option>`).join(''); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formJson(form){ return Object.fromEntries(new FormData(form).entries()); }

async function loadOptions(){
  state.options = await api('/profile/options');
  $('pathPills').innerHTML = state.options.trust_paths.map(p => `<div class="pill">${escapeHtml(p)}</div>`).join('');
  fillSelect($('trustTypeSelect'), state.options.trust_paths);
  fillSelect($('assetCategorySelect'), state.options.asset_categories);
  fillSelect($('beneficiaryCategorySelect'), state.options.beneficiary_categories);
  fillSelect($('roleSelect'), state.options.role_types);
  fillSelect($('docTypeSelect'), state.options.doc_types);
}

async function checkAuth(){
  try{
    const me = await api('/auth/me');
    state.user = me.user;
    document.body.classList.add('is-authed');
    await loadProfile();
  }catch(e){
    state.user = null;
    document.body.classList.remove('is-authed');
  }
}

async function loadProfile(){
  state.data = await api('/profile');
  renderAll();
}

function renderAll(){
  const d = state.data; if(!d) return;
  const p = d.profile;
  $('dashTrustName').textContent = p.trust_name ? `${p.trust_name} Dashboard` : 'Federated Trust Dashboard';
  $('completionBar').style.width = d.completion + '%';
  $('completionText').textContent = d.completion + '%';
  $('statCovenant').textContent = p.covenant_status || 'Not Started';
  $('statAssets').textContent = `${d.assets.length} mapped`;
  $('statBeneficiaries').textContent = `${d.beneficiaries.length} mapped`;
  $('statLegal').textContent = p.legal_status || 'Preparation Needed';
  $('statFederation').textContent = p.federation_status || 'Draft';
  $('nextStep').textContent = nextStep(d);

  const identity = $('identityForm');
  identity.trust_name.value = p.trust_name || '';
  identity.trust_type.value = p.trust_type || state.options.trust_paths[0];
  identity.federation_status.value = p.federation_status || 'Draft';
  identity.legal_status.value = p.legal_status || 'Preparation Needed';

  const cov = $('covenantForm');
  ['protect_answer','serve_answer','principles_answer','stewarding_answer','never_violate_answer','legacy_answer'].forEach(k => cov[k].value = p[k] || '');
  $('missionOut').textContent = p.mission || 'Complete the covenant questions to generate your mission statement.';
  $('purposeOut').textContent = p.purpose || 'Complete the covenant questions to generate your trust purpose.';
  $('covenantOut').textContent = p.covenant || 'Complete the covenant questions to generate your polished covenant.';

  renderCards('assetList', d.assets, i => [i.name, i.category, `${i.description || ''} ${i.status ? '— '+i.status : ''}`]);
  renderCards('beneficiaryList', d.beneficiaries, i => [i.name, i.category, `${i.relationship || ''} ${i.purpose ? '— '+i.purpose : ''}`]);
  renderCards('roleList', d.roles, i => [i.name, i.role, i.duties || '']);
  renderCards('fileList', d.files, i => [i.original_filename, i.doc_type, `${i.notes || ''} Uploaded: ${new Date(i.uploaded_at).toLocaleString()}`]);
}

function nextStep(d){
  const p = d.profile;
  if(!p.trust_name || !p.trust_type) return 'Name your trust and choose a trust path.';
  if(!p.covenant) return 'Answer the covenant questions and generate the covenant.';
  if(d.assets.length === 0) return 'Map at least one asset, gift, or legacy field.';
  if(d.beneficiaries.length === 0) return 'Map at least one beneficiary or future generation category.';
  if(d.roles.length === 0) return 'Assign at least one stewardship role.';
  if(d.files.length === 0) return 'Upload at least one supporting file into the local Trust Vault.';
  return 'Review and print your Federated Trust Identity Packet.';
}

function renderCards(id, items, mapper){
  const container = $(id); const tpl = $('cardTemplate'); container.innerHTML = '';
  if(!items.length){ container.innerHTML = '<p class="disclaimer">Nothing added yet.</p>'; return; }
  items.forEach(item => {
    const [title, meta, body] = mapper(item);
    const node = tpl.content.cloneNode(true);
    qs('strong', node).textContent = title;
    qs('small', node).textContent = meta;
    qs('p', node).textContent = body;
    container.appendChild(node);
  });
}

function renderPacket(){
  const d = state.data; if(!d) return;
  const p = d.profile;
  $('packetTrustName').textContent = p.trust_name || 'Unnamed Federated Trust';
  $('packetTrustType').textContent = p.trust_type || 'Trust path not selected';
  $('packetMission').textContent = p.mission || 'Mission not generated yet.';
  $('packetCovenant').textContent = p.covenant || 'Covenant not generated yet.';
  $('packetPurpose').textContent = p.purpose || 'Purpose not generated yet.';
  renderCards('packetAssets', d.assets, i => [i.name, i.category, i.description || i.status]);
  renderCards('packetBeneficiaries', d.beneficiaries, i => [i.name, i.category, `${i.relationship || ''} ${i.purpose || ''}`]);
  renderCards('packetRoles', d.roles, i => [i.name, i.role, i.duties || '']);
  $('packetSummary').textContent = `${p.trust_name || 'This trust'} is currently marked as ${p.federation_status || 'Draft'} with legal preparation status: ${p.legal_status || 'Preparation Needed'}. Completion score: ${d.completion}%.`;
}

function bind(){
  qsa('[data-route]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); route(a.dataset.route); }));
  $('signupForm').addEventListener('submit', async e => { e.preventDefault(); try{ await api('/auth/signup',{method:'POST',body:JSON.stringify(formJson(e.target))}); await checkAuth(); route('dashboard'); }catch(err){ showMessage(err.message); }});
  $('loginForm').addEventListener('submit', async e => { e.preventDefault(); try{ await api('/auth/login',{method:'POST',body:JSON.stringify(formJson(e.target))}); await checkAuth(); route('dashboard'); }catch(err){ showMessage(err.message); }});
  $('logoutBtn').addEventListener('click', async () => { await api('/auth/logout',{method:'POST'}); state.user=null; state.data=null; document.body.classList.remove('is-authed'); route('landing'); });
  $('identityForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile',{method:'PUT',body:JSON.stringify(formJson(e.target))}); await loadProfile(); route('dashboard'); });
  $('covenantForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile/covenant',{method:'PUT',body:JSON.stringify(formJson(e.target))}); await loadProfile(); });
  $('assetForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile/assets',{method:'POST',body:JSON.stringify(formJson(e.target))}); e.target.reset(); await loadProfile(); });
  $('beneficiaryForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile/beneficiaries',{method:'POST',body:JSON.stringify(formJson(e.target))}); e.target.reset(); await loadProfile(); });
  $('roleForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile/roles',{method:'POST',body:JSON.stringify(formJson(e.target))}); e.target.reset(); await loadProfile(); });
  $('vaultForm').addEventListener('submit', async e => { e.preventDefault(); await api('/profile/vault',{method:'POST',body:new FormData(e.target)}); e.target.reset(); await loadProfile(); });
  qsa('.tabs button').forEach(btn => btn.addEventListener('click', () => { qsa('.tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); qsa('.tab-panel').forEach(p=>p.classList.remove('active')); $('tab-'+btn.dataset.tab).classList.add('active'); }));
}

async function boot(){
  bind();
  await loadOptions();
  await checkAuth();
  const hash = location.hash?.slice(1) || 'landing';
  route(hash);
}
boot();
