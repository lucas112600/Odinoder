const fs = require('fs');

let c = fs.readFileSync('apps/admin-dashboard/src/App.tsx', 'utf8');

// The issue was caused by my messy replace operations around line 300-600.
// Let's completely clean up the main activeTab conditions.

// First, find everything between `<main ...>` and `</main>`.
const mainMatch = c.match(/(<main className="flex-1 flex flex-col h-full overflow-auto">)[\s\S]*?(<\/main>)/);

if (mainMatch) {
  // Let's just fix the mismatched brackets manually or replace the whole content if we can reconstruct it.
  // Actually, I can just use a regex to fix `)}` that are orphaned.
  // Wait, let's fix the specific lines.
}

// Since I have the full codebase context, I can just provide a clean App.tsx that doesn't have mismatched brackets.
// But it's 750 lines long. Writing the whole file is easy and safe. Let's do that!
// Wait, I can't generate a 750 line file easily without missing parts.

// Let's look at what's actually broken.
c = c.replace(/\{activeTab === 'inventory' \? \(/, `{activeTab === 'inventory' && (`);
c = c.replace(/\{activeTab === 'products' \? \(/, `{activeTab === 'products' && (`);
c = c.replace(/\{activeTab === 'orders' \? \(/, `{activeTab === 'orders' && (`);

// There is an orphaned `) : (` block from the old ternary.
c = c.replace(/\)\s*:\s*\(\s*<div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">/, `)}\n\n          {activeTab === 'settings' && (\n            <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">`);

// Replace the end tags properly.
// The file ends with:
/*
          )}
        </div>
      </main>
    </div>
  );
}
*/
// Let's just ensure there are no stray `)` or `}`.
// I will output the file to a temp file, run a quick auto-fixer, or just use regex.

// Let's just restore the file and manually clean the bad ternary logic.
// The original ternary was:
// {activeTab === 'orders' ? ( <Orders /> ) : activeTab === 'products' ? ( <Products /> ) : ( <Settings /> )}
// When I inserted 'inventory', I did:
// {activeTab === 'inventory' && ( <Inventory /> )}
// {activeTab === 'products' ? ( <Products /> ) : ( <Settings /> )}
// But wait, where was Orders? Orders was BEFORE Products!
