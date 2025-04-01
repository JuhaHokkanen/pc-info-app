// Reactin hookit: useEffect tiedon hakemiseen ja useState tilan hallintaan
import { useEffect, useState } from 'react';
// CSS-tyylitiedosto tälle komponentille
import './PcInfo.css';

// PcInfo-komponentti näyttää tietokoneen järjestelmätiedot
function PcInfo() {
  // Tila tietokoneen tiedoille (haetaan JSON:ista)
  const [info, setInfo] = useState(null);
  // Lataustila, näytetään "Ladataan..." kun true
  const [loading, setLoading] = useState(true);
  // Virheviesti, jos tiedon haku epäonnistuu
  const [error, setError] = useState(null);

  // useEffect ajetaan kerran, kun komponentti ladataan
  useEffect(() => {
    // Haetaan tiedot tiedostosta public/pcinfo.json
    fetch(`${import.meta.env.BASE_URL}pcinfo.json`)
      .then((res) => {
        // Jos vastaus ei ole ok, annetaan virhe
        if (!res.ok) throw new Error("Virhe ladattaessa pcinfo.json");
        // Muutetaan vastaus JSON:iksi
        return res.json();
      })
      .then((data) => {
        // Näytetään data konsolissa ja tallennetaan tilaan
        console.log("JSON saatu:", data);
        setInfo(data);
        setLoading(false); // Lataus valmis
      })
      .catch((err) => {
        // Jos virhe tapahtuu, tallennetaan virheviesti
        setError(err.message);
        setLoading(false); // Lopetetaan latausvirhetilassa
      });
  }, []); // Tyhjä riippuvuuslista → ajetaan vain kerran

  // Jos vielä ladataan tietoja, näytetään latausviesti
  if (loading) return <p>Ladataan tietoja...</p>;
  // Jos tapahtui virhe, näytetään virhe
  if (error) return <p>Virhe: {error}</p>;
  // Jos info on vielä null (ei dataa), näytetään varaviesti
  if (!info) return <p>Ei tietoja saatavilla.</p>;

  // Jos kaikki kunnossa, näytetään taulukko tietokoneen tiedoista
  return (
    <div className="pcinfo-container">
      <h2>Tietokoneen tiedot</h2>
      <table className="pcinfo-table">
        <tbody>
          {/* Jokainen Row näyttää yhden tietorivin taulukossa */}

          <Row label="Tietokoneen nimi" value={info.System.ComputerName} />
          <Row label="Käyttöjärjestelmä" value={`${info.System.OSName} (versio ${info.System.OSVersion}, build ${info.System.OSBuild})`} />

          <Row label="Viimeinen käynnistys" value={info.System.LastBoot} />

          {/* Tämä toimii oikein koska käytetään formatTimestamp-funktiota */}
          <Row label="Päivämäärä" value={formatTimestamp(info.System.Timestamp)} />

          <Row label="Prosessori" value={info.Processor.Name} />
          <Row label="Prosessorin tiedot: " value={`Ytimiä: ${info.Processor.Cores} Säikeitä: ${info.Processor.Threads}`} />
          <Row label="Emolevyn valmistaja:" value={info.Motherboard.Manufacturer} />
          <Row label="Emolevyn malli:" value={info.Motherboard.Model} />
          <Row label="Prosessori" value={info.Processor.Name} />

          <Row label="Muisti" value={`${info.Memory.TotalMemoryGB} GB`} />
          <Row label="Näytönohjain" value={info.Graphics.GPU} />
          <Row label="BIOS-valmistaja" value={info.BIOS.Manufacturer} />
          <Row label="Käyttäjä" value={info.User.Username} />
          <Row label="Käyttäjän kotikansion koko" value={`${info.User.FolderSizeGB} GB`} />
          <Row label="C-asema: " value={`${info.Disk.UsedSpaceGB} / ${info.Disk.TotalSizeGB} GB (${info.Disk.FreeSpaceGB} GB vapaana) Tyyppi: ${info.Disk.Type}`} />
        </tbody>
      </table>

      {/* Näytetään keruun aikaleima suoraan (ISO-tyyli) */}
      <h2>Data Retrieved At</h2>
      <p>{formatTimestamp(info.System.Timestamp)}</p>

      {/* footer */}
      <footer>
        <p>&copy; 2025 Juha Hokkanen. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Row-komponentti näyttää yhden rivin taulukossa: otsikko + arvo
function Row({ label, value }) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value ?? '—'}</td> {/* Jos value on null/undefined → näytetään viiva */}
    </tr>
  );
}



// Aputoiminto: korjaa timestampin muodosta "01.04.2025 10.23.42" → Date-objektiksi
function formatTimestamp(timestamp) {
  try {
    // Vaihdetaan "01.04.2025 10.23.42" → "2025-04-01T10:23:42"
    const formatted = timestamp.replace(' ', 'T').replace(/\./g, ':');

    // Luodaan Date-objekti muokatusta merkkijonosta
    const date = new Date(formatted);

    // Palautetaan suomalaisessa muodossa (päivämäärä + aika)
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp; // Jos virhe, näytetään alkuperäinen
  }
}

// Viedään komponentti muualle käytettäväksi
export default PcInfo;
