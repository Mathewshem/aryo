insert into public.aryo_talent (name, slug, category, sort_order) values
  ('DJ AceKing','dj-aceking','dj',0),
  ('DJ Seme','dj-seme','dj',1),
  ('DJ Kronikxx','dj-kronikxx','dj',2),
  ('DJ Hypnotic','dj-hypnotic','dj',3),
  ('DJ Pikachu','dj-pikachu','dj',4),
  ('DJ Swaj','dj-swaj','dj',5),
  ('DJ Andre Addiction','dj-andre-addiction','dj',6),
  ('DJ Rickie Mfalme','dj-rickie-mfalme','dj',7),
  ('DJ Levin Nyaxx','dj-levin-nyaxx','dj',8),
  ('DJ Incredible','dj-incredible','dj',9),
  ('DJ Abbas','dj-abbas','dj',10),
  ('DJ Armani','dj-armani','dj',11),
  ('DJ Cibin','dj-cibin','dj',12),
  ('DJ Creme De La Creme','dj-creme-de-la-creme','dj',13),
  ('DJ Jamster','dj-jamster','dj',14),
  ('DJ Purple','dj-purple','dj',15),
  ('Feel DJ Ray','feel-dj-ray','dj',16),
  ('Sparky Nderu','sparky-nderu','host',0),
  ('Mitchelle Wanjiku','mitchelle-wanjiku','host',1),
  ('Matiba Amapiano','matiba-amapiano','host',2),
  ('Joe Muchiri','joe-muchiri','host',3),
  ('The Goodvibetribe Ogonji','the-goodvibetribe-ogonji','host',4),
  ('Jeddi','jeddi','host',5),
  ('GT Luxury','gt-luxury','designer',0),
  ('SN Tailor','sn-tailor','designer',1),
  ('Val Stylist','val-stylist','designer',2),
  ('Loyalty','loyalty','designer',3),
  ('RM Tailored','rm-tailored','designer',4),
  ('Sir George','sir-george','designer',5),
  ('MJerry Designs','mjerry-designs','designer',6),
  ('P Unit','p-unit','artist',0),
  ('Berry Tha Boss','berry-tha-boss','mc',0),
  ('Miss Micha Official','miss-micha-official','mc',1)
on conflict (slug) do nothing;
insert into public.aryo_clubs (name, slug, tagline, is_flagship, location, sort_order) values
  ('ARYO Nairobi','aryo-nairobi','The Mother',true,'Astrol Square, Red Hill Rd, Nairobi',0),
  ('Manhattan','manhattan',null,false,null,1),
  ('Cohiba','cohiba',null,false,null,2),
  ('Cavalli','cavalli',null,false,null,3),
  ('Kikies Lounge','kikies-lounge',null,false,null,4),
  ('Konka','konka',null,false,null,5)
on conflict (slug) do nothing;
insert into public.aryo_partners (name, kind, sort_order) values
  ('Hennessy','sponsor',0),
  ('Martell','sponsor',1),
  ('EABL','sponsor',2),
  ('Aquamist','sponsor',3),
  ('Coca-Cola','sponsor',4),
  ('Red Bull','sponsor',5),
  ('Durex','sponsor',6),
  ('Nightlife 254','media',0);
update public.aryo_partners set hero_brand = true where name = 'Hennessy';
-- First admin. Temporary password must be changed on first sign-in.
insert into public.aryo_staff (name, email, role, title, password_hash, must_change_password)
values ('ARYO Director', 'aryo@gmail.com', 'admin', 'Director', '$2b$10$JSQDsQj3eNHAMbOxNwHr8uwfI1NkFk5dhKhAl8/rH4j9AAc7FG2Dm', true)
on conflict (email) do nothing;
