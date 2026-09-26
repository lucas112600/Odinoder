const fs = require('fs');
let c = fs.readFileSync('apps/pos-tablet/src/App.tsx', 'utf8');
c = c.replace(/import React, \{ useState, useEffect \} from 'react';/, `import { useState, useEffect } from 'react';`);
fs.writeFileSync('apps/pos-tablet/src/App.tsx', c);
