import { Page, Text, View, Document, StyleSheet, Image as PdfImage } from '@react-pdf/renderer'
import type { SummaryState } from '../SummaryComponent/SummaryTypes'

function toPdfImageUri(dataUrl?: string | null): string | null {
  if (!dataUrl) return null;
  const trimmed = dataUrl.trim();
  return trimmed.startsWith('data:image/') ? trimmed : null;
}

export const MyPDFDocument = ({ summary }: { summary: SummaryState }) => {
  const { qaList } = summary;
  const mapImageUri = toPdfImageUri(summary.mapScreenshot);
  const proximityResponse = summary.proximityDetail;

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#F3F4F6',
      padding: 24,
      fontFamily: 'Helvetica'
    },
    section: {
      marginBottom: 14,
      padding: 14,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB'
    },
    header: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#0F172A',
      color: '#FFFFFF'
    },
    eyebrow: {
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#93C5FD',
      marginBottom: 6
    },
    mapImage: {
      width: '100%',
      height: 210,
      objectFit: 'cover',
      marginBottom: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB'
    }
  });

  const titleStyle = StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'left',
      color: '#FFFFFF'
    },
    subtitle: {
      fontSize: 11,
      lineHeight: 1.4,
      color: '#E2E8F0',
      maxWidth: 420
    }
  })

   const secondTitleStyle = StyleSheet.create({
    title: {
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'left',
      color: '#111827'
    },
    row: {
      fontSize: 11,
      lineHeight: 1.45,
      color: '#374151'
    },
    badge: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: '#DBEAFE',
      color: '#1D4ED8',
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 10
    }
  })

  const proximityRows = proximityResponse?.rawData ?? [];

  return (
    <Document title="DiBK veiviser">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DiBK veiviser</Text>
          <Text style={titleStyle.title}>
            Sammendrag av tiltaket
          </Text>
          <Text style={titleStyle.subtitle}>
            Denne rapporten viser spørresvar, kartbilde og avstandsvurderinger fra den siste beregningen.
          </Text>
        </View>
        {mapImageUri ? (
          <PdfImage src={{ uri: mapImageUri }} style={styles.mapImage} />
        ) : (
          <View style={styles.section}>
            <Text style={secondTitleStyle.row}>Ingen kartskjermbilde tilgjengelig</Text>
          </View>
        )}
        {qaList.map((item) => (
          <View key={item.questionId} style={styles.section}>
            <Text style={secondTitleStyle.badge}>Spørsmål</Text>
            <Text style={secondTitleStyle.title}>{item.questionTitle}</Text>
            <Text style={secondTitleStyle.row}>{item.answer || 'Ikke besvart'}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={secondTitleStyle.badge}>Rådata</Text>
          <Text style={secondTitleStyle.title}>
            Distanse
          </Text>
          {proximityRows.length ? (
            proximityRows.map((row, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 10,
                  borderRadius: 8,
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <Text style={secondTitleStyle.badge}>{row.source}</Text>
                <Text style={secondTitleStyle.row}>Avstand: {row.distance_m.toFixed(1)} m</Text>
                <Text style={secondTitleStyle.row}>
                  Påkrevd avstand: {row.paakrevd_avstand == null ? '—' : `${row.paakrevd_avstand} m`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={secondTitleStyle.row}>Ingen data fra nærhetsanalyse</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};