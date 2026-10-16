// Laut realistik di belakang peta: dua lapisan tekstur (public/map/laut.webp) bergerak
// ke arah berlawanan dan bercampur, menghasilkan riak dan kilauan. Dianimasi dengan
// transform sahaja supaya ringan.
export default function Sea() {
  return (
    <div className="sea" aria-hidden="true">
      <div className="sea-a" />
      <div className="sea-b" />
    </div>
  );
}
