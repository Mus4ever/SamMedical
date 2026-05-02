/**
 * Auth controller — login, getMe, changePassword.
 *
 * Login is intentionally vague on errors ("Numéro ou mot de passe incorrect")
 * to avoid leaking which field is wrong (standard auth UX).
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/env');
const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { normalizePhone } = require('../utils/phone');

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError(400, 'Données invalides', errors.array());
    }

    const { phone, password } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const result = await query(
      `SELECT id, full_name, phone, email, password_hash, role, is_active
         FROM users
        WHERE phone = $1`,
      [normalizedPhone]
    );

    // Same error message whether the user exists or the password is wrong.
    const fail = () => { throw new HttpError(401, 'Numéro ou mot de passe incorrect'); };

    if (result.rows.length === 0) fail();
    const user = result.rows[0];
    if (!user.is_active) throw new HttpError(401, 'Compte désactivé');

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) fail();

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id:       user.id,
        fullName: user.full_name,
        phone:    user.phone,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

/**
 * Change own password — both admin and patient.
 * Requires the current password to prove ownership of the session.
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError(400, 'Données invalides', errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) throw new HttpError(404, 'Utilisateur introuvable');

    const ok = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!ok) throw new HttpError(401, 'Mot de passe actuel incorrect');

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Mot de passe modifié' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword };
