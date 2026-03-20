export function showInfo(message) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  const box = document.createElement('div');
  box.className = 'confirm-box';
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  const actions = document.createElement('div');
  actions.className = 'confirm-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-cancel';
  cancelBtn.textContent = 'OK';
  actions.appendChild(cancelBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  cancelBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

export function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  const box = document.createElement('div');
  box.className = 'confirm-box';
  const p = document.createElement('p');
  p.textContent = message;
  box.appendChild(p);
  const actions = document.createElement('div');
  actions.className = 'confirm-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-cancel';
  cancelBtn.textContent = 'Cancel';
  const dangerBtn = document.createElement('button');
  dangerBtn.className = 'btn-danger';
  dangerBtn.textContent = 'Delete';
  actions.appendChild(cancelBtn);
  actions.appendChild(dangerBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  cancelBtn.addEventListener('click', () => overlay.remove());
  dangerBtn.addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
