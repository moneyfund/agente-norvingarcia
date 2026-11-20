import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { ALLOWED_ADMIN_EMAIL, hasAdminSession } from '../src/config/admin.js';

const projectId = 'demo-ng-access';
const roles = {
  visitante: null,
  cliente: { email: 'cliente@example.test', verified: true, provider: 'google.com' },
  sinVerificar: { email: ALLOWED_ADMIN_EMAIL, verified: false, provider: 'google.com' },
  otroProveedor: { email: ALLOWED_ADMIN_EMAIL, verified: true, provider: 'password' },
  administrador: { email: ALLOWED_ADMIN_EMAIL, verified: true, provider: 'google.com' },
};
const privateCollections = ['avaluos', 'captaciones', 'properties', 'zonas'];
const privateFiles = ['avaluos/ejemplo/principal/imagen.png', 'avaluos/ejemplo/informe.pdf', 'listado/ejemplo/imagen.png'];
const bytes = Uint8Array.of(1, 2, 3);
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
    storage: { rules: await readFile('storage.rules', 'utf8') },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const name of [...privateCollections, 'propiedades']) await setDoc(doc(ctx.firestore(), name, 'ejemplo'), { titulo: 'Prueba local' });
    for (const name of privateFiles) await uploadBytes(ref(ctx.storage(), name), bytes);
  });
});
after(async () => { await env?.cleanup(); });

for (const [name, role] of Object.entries(roles)) {
  test(name, async () => {
    const claims = role && { email: role.email, email_verified: role.verified, firebase: { sign_in_provider: role.provider } };
    const ctx = claims ? env.authenticatedContext(name, claims) : env.unauthenticatedContext();
    const db = ctx.firestore();
    const store = ctx.storage();
    const admin = name === 'administrador';
    const check = admin ? assertSucceeds : assertFails;
    assert.equal(hasAdminSession(claims), admin);
    for (const path of privateCollections) {
      await check(getDoc(doc(db, path, 'ejemplo')));
      await check(getDocs(collection(db, path)));
      await check(setDoc(doc(db, path, 'escritura'), { dato: true }));
    }
    for (const path of privateFiles) {
      await check(getBytes(ref(store, path)));
      await check(uploadBytes(ref(store, path), bytes));
    }
    await assertSucceeds(getDoc(doc(db, 'propiedades', 'ejemplo')));
    await check(setDoc(doc(db, 'propiedades', 'cambio'), { titulo: 'Prueba local' }));
    if (name === 'cliente') {
      await assertSucceeds(setDoc(doc(db, 'users', name), { uid: name, displayName: 'Cliente' }));
      await assertFails(setDoc(doc(db, 'users', name), { role: 'admin' }, { merge: true }));
      await assertSucceeds(setDoc(doc(db, 'formularios', 'propietario'), {
        uid: name, userName: 'Cliente', userEmail: role.email, userPhotoURL: null,
        phone: '00000000', message: 'Consulta de prueba local', createdAt: serverTimestamp(), status: 'nuevo',
      }));
    }
  });
}
