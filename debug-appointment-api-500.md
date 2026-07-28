# [OPEN] Debug Session - appointment-api-500

## Symptomes
- `POST /api/public/appointments` repond `500`
- Le navigateur affiche `Unexpected end of JSON input`
- Aucun mail n'apparait comme envoye dans Resend

## Hypotheses
- `A` L'appel Resend echoue a cause du `from` ou du domaine non valide
- `B` La table `email_logs` est absente et la journalisation plante
- `C` Le rendu du template React mail plante pendant l'envoi
- `D` La route API leve une exception non capturee et renvoie un corps vide
- `E` La creation du rendez-vous reussit mais la partie email casse la reponse

## Plan
- Demarrer le Debug Server
- Instrumenter la route `/api/public/appointments` et le service email
- Reproduire le bug
- Lire les logs runtime
- Corriger minimalement selon preuve
