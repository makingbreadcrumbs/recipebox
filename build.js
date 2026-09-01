#!/usr/bin/env node
// Rebuilds every recipe card and index.html from recipes.json.
// No dependencies.  Run:  node build.js
//
// recipes.json is the single source of truth. Do NOT hand-edit the generated
// *_Recipe.html files or index.html -- they are overwritten on the next run.
// To change content, edit recipes.json.
// To change the design, edit _template_card.html / _template_index.html.

var fs = require('fs');
var path = require('path');

var ROOT = process.argv[2] || '.';
var CATEGORY_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Sides', 'Snacks'];

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }

var cardTpl = read('_template_card.html');
var indexTpl = read('_template_index.html');
var recipes = JSON.parse(read('recipes.json')).recipes;

function sortCategories(list) {
  return list.slice().sort(function (a, b) {
    return CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b);
  });
}

function jsStr(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Replace {{NAME}} without letting $-sequences in the value be interpreted.
function fill(tpl, key, value) {
  return tpl.split('{{' + key + '}}').join(value);
}

// -------------------------------------------------------------- card blocks

function categoryRow(cats) {
  var sep = '        <span style="color:rgba(32,30,29,0.4);"> &middot; </span>';
  var links = sortCategories(cats).map(function (c) {
    return '        <a class="category-link" href="index.html?category=' + c + '">' + c + '</a>';
  });
  return links.length > 1 ? links.join('\n' + sep + '\n') : links[0];
}

function ingredients(groups) {
  return groups.map(function (g, i) {
    var wrap = i === 1
      ? 'padding-left:32px;border-left:2px solid rgba(32,30,29,0.4);'
      : 'padding-right:32px;';
    var items = g.items.map(function (it) {
      return '        <li style="display:flex;justify-content:space-between;font-size:14px;'
        + 'border-bottom:1px solid rgba(32,30,29,0.2);padding-bottom:10px;">'
        + '<span>' + it.name + '</span>'
        + '<span style="font-weight:800;color:#ae1800;">' + it.qty + '</span></li>';
    }).join('\n');
    var foot = g.footnote
      ? '\n      <p style="font-size:12px;font-style:italic;color:#605d5d;margin:16px 0 0;line-height:1.5;">'
        + g.footnote + '</p>'
      : '';
    return '    <div style="' + wrap + '">\n'
      + '      <h3 style="font-family:\'Archivo\',system-ui,sans-serif;font-weight:800;font-size:20px;margin:0 0 4px;">'
      + g.name + '</h3>\n'
      + '      <div style="font-size:12px;color:#605d5d;margin-bottom:16px;">' + g.note + '</div>\n'
      + '      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;">\n'
      + items + '\n'
      + '      </ul>' + foot + '\n'
      + '    </div>';
  }).join('\n');
}

function directions(groups) {
  var n = 1;
  return groups.map(function (g, i) {
    var wrap = i === 1
      ? 'padding-left:32px;border-left:2px solid rgba(32,30,29,0.4);'
      : 'padding-right:32px;';
    var steps = g.steps.map(function (s, j) {
      return '        <li style="display:flex;gap:12px;font-size:14px;line-height:1.55;">'
        + '<span style="font-weight:800;color:#ae1800;flex:none;">' + (n + j) + '</span>'
        + '<span>' + s + '</span></li>';
    }).join('\n');
    n += g.steps.length;
    return '    <div style="' + wrap + '">\n'
      + '      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;'
      + 'color:#ae1800;font-weight:800;margin-bottom:14px;">' + g.label + '</div>\n'
      + '      <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px;">\n'
      + steps + '\n'
      + '      </ol>\n'
      + '    </div>';
  }).join('\n');
}

function credit(r) {
  if (r.creditRaw) return r.creditRaw;              // no single source URL
  var inner = r.sourceUrl
    ? '<a href="' + r.sourceUrl + '" target="_blank" rel="noopener" style="color:#605d5d;">'
      + r.creditName + '</a>'
    : r.creditName;
  return (r.creditPrefix || 'Recipe: ') + inner;
}

function renderCard(r) {
  var out = cardTpl;
  out = fill(out, 'TITLE', r.title);
  out = fill(out, 'CATEGORY_ROW', categoryRow(r.categories));
  out = fill(out, 'SUBTITLE', r.subtitle);
  out = fill(out, 'PHOTO', r.photo);
  out = fill(out, 'ALT', r.alt);
  out = fill(out, 'SERVES', r.serves);
  out = fill(out, 'PREP', r.prep);
  out = fill(out, 'COOK', r.cook);
  out = fill(out, 'DIFFICULTY', r.difficulty);
  out = fill(out, 'STORY', r.story);
  out = fill(out, 'INGREDIENTS', ingredients(r.ingredientGroups));
  out = fill(out, 'DIRECTIONS', directions(r.directionGroups));
  out = fill(out, 'TIPS', r.tips.map(function (t) { return '      <li>' + t + '</li>'; }).join('\n'));
  out = fill(out, 'CREDIT', credit(r));
  return out;
}

function renderIndex(list) {
  var entries = list.slice().sort(function (a, b) {
    return a.slug.localeCompare(b.slug);
  }).map(function (r) {
    var cats = sortCategories(r.categories).map(function (c) { return "'" + c + "'"; }).join(', ');
    var tags = r.tags.map(function (t) { return "'" + jsStr(t) + "'"; }).join(', ');
    return "  { title: '" + jsStr(r.title) + "', categories: [" + cats + '], tags: [' + tags
      + "], desc: '" + jsStr(r.desc) + "', serves: '" + r.serves + "', prep: '" + r.prep
      + "', cook: '" + r.cook + "', dateAdded: '" + r.dateAdded
      + "', html: '" + r.slug + "_Recipe.html' },";
  }).join('\n');
  return fill(indexTpl, 'RECIPES', entries);
}

// ---------------------------------------------------------------- run + check

var problems = [];
recipes.forEach(function (r) {
  ['slug', 'title', 'subtitle', 'photo', 'alt', 'serves', 'prep', 'cook', 'difficulty', 'story', 'dateAdded']
    .forEach(function (k) { if (!r[k]) problems.push(r.slug + ': missing ' + k); });
  if (!r.categories || !r.categories.length) problems.push(r.slug + ': no categories');
  (r.categories || []).forEach(function (c) {
    if (CATEGORY_ORDER.indexOf(c) < 0) problems.push(r.slug + ': unknown category ' + c);
  });
  if (!r.tags || !r.tags.length) problems.push(r.slug + ': no tags');
  if (!r.tips || !r.tips.length) problems.push(r.slug + ': no tips');
  if (!r.creditRaw && !r.creditName) problems.push(r.slug + ': no credit');
});
if (problems.length) {
  console.error('recipes.json has problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}

var written = 0;
recipes.forEach(function (r) {
  var html = renderCard(r);
  var left = html.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error(r.slug + ': unfilled placeholders ' + left.join(', '));
  fs.writeFileSync(path.join(ROOT, r.slug + '_Recipe.html'), html);
  written++;
});

var idx = renderIndex(recipes);
if (/\{\{[A-Z_]+\}\}/.test(idx)) throw new Error('index.html: unfilled placeholders');
fs.writeFileSync(path.join(ROOT, 'index.html'), idx);

console.log('Rebuilt ' + written + ' recipe cards + index.html from recipes.json');
