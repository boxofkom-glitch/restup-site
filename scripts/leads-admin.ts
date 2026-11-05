// Suivi local des demandes : liste, détail, changement d'état commercial (historisé), suppression.
// Usage : npm run leads:admin -- list | show <id> | status <id> <état> <auteur> | delete <id> | queue
import { DatabaseSync } from 'node:sqlite';

const STATUSES = ['nouveau', 'en cours', 'qualifié', 'non qualifié', 'clôturé'];
const db = new DatabaseSync(process.env.LEADS_DB ?? '.data/leads.sqlite');
const [cmd, id, status, by] = process.argv.slice(2);

switch (cmd) {
  case 'list':
    console.table(
      db
        .prepare(
          `SELECT id, created_at, form_type, commercial_status,
           (SELECT group_concat(kind || ':' || status) FROM notifications n WHERE n.lead_id = leads.id) AS notifications
           FROM leads ORDER BY created_at DESC`
        )
        .all()
    );
    break;
  case 'show':
    console.log(db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id));
    console.table(db.prepare(`SELECT * FROM status_history WHERE lead_id = ? ORDER BY changed_at`).all(id));
    break;
  case 'status': {
    if (!STATUSES.includes(status) || !by)
      throw new Error(`État attendu : ${STATUSES.join(', ')} ; auteur obligatoire.`);
    db.exec('BEGIN');
    db.prepare(`UPDATE leads SET commercial_status = ? WHERE id = ?`).run(status, id);
    db.prepare(`INSERT INTO status_history VALUES (?, ?, ?, ?)`).run(id, status, new Date().toISOString(), by);
    db.exec('COMMIT');
    console.log('État mis à jour.');
    break;
  }
  case 'delete':
    db.prepare(`DELETE FROM leads WHERE id = ?`).run(id);
    console.log('Demande supprimée (notifications et historique compris).');
    break;
  case 'queue':
    console.table(
      db.prepare(`SELECT id, lead_id, kind, status, attempts, next_attempt_at, last_error FROM notifications`).all()
    );
    break;
  default:
    console.log('Commandes : list | show <id> | status <id> <état> <auteur> | delete <id> | queue');
}
