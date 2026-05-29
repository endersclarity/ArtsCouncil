import json, io, collections
p = json.load(io.open('_census_patch.json', encoding='utf-8'))
print('patch records:', len(p))
for k, v in collections.Counter(r.get('decision') for r in p).most_common():
    print('  %4d  %s' % (v, k))
acc = [r for r in p if r.get('decision') == 'accept' and r.get('shift_m') is not None]
sh = sorted(r['shift_m'] for r in acc)
mid = sh[len(sh)//2]
print('\naccepted=%d  median_shift=%.1fm  max=%.1fm' % (len(acc), mid, sh[-1]))
print('  <=25m: %d   25-100m: %d   >100m: %d' % (
    sum(1 for s in sh if s <= 25),
    sum(1 for s in sh if 25 < s <= 100),
    sum(1 for s in sh if s > 100)))
big = sorted([r for r in acc if r['shift_m'] > 200], key=lambda x: -x['shift_m'])
print('\naccepted shift>200m: %d (eyeball these next session)' % len(big))
for r in big[:10]:
    print('  %6.0fm  %-30s %-14s' % (r['shift_m'], str(r.get('name'))[:30], str(r.get('osm_kind'))))
