import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import type { SummaryState } from '../SummaryComponent/SummaryTypes'

function toJsonLines(value: unknown): string[] {
  if (value == null) return ['Mangler']

  try {
    const text = JSON.stringify(value, null, 2)
    return text ? text.split('\n') : ['Mangler']
  } catch {
    return [String(value)]
  }
}

export const MyRawDataSummary = ({ summary }: { summary: SummaryState }) => {
  const rawDataResponse = summary.propertyRawData

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#F7F7F5',
      padding: 24,
      fontFamily: 'Helvetica'
    },
    section: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB'
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'left',
      color: '#111827'
    },
    subtitle: {
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 6,
      marginBottom: 8,
      textAlign: 'left',
      color: '#111827'
    },
    row: {
      marginBottom: 4,
      fontSize: 11,
      color: '#374151'
    },
    codeBlock: {
      marginTop: 4,
      marginBottom: 8,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: '#CBD5E1'
    },
    codeLine: {
      fontSize: 7.5,
      lineHeight: 1.32,
      color: '#111827',
      fontFamily: 'Courier'
    }
  })

  return (
    <Document title="Rådata for eiendom">
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>
            Rådata for eiendom{rawDataResponse?.teigId != null ? ` - Teig ID: ${rawDataResponse.teigId}` : ''}
          </Text>
          {rawDataResponse ? (
            <>
              <Text style={styles.subtitle}>Oversikt</Text>
              <Text style={styles.row}>
                Teig ID: {rawDataResponse.teigId == null ? '—' : String(rawDataResponse.teigId)}
              </Text>
              <Text style={styles.row}>
                Eiendomsareal: {rawDataResponse.eiendomAreal == null ? '—' : `${rawDataResponse.eiendomAreal} m²`}
              </Text>
              <Text style={styles.row}>
                Bygningsareal: {rawDataResponse.bygningAreal == null ? '—' : `${rawDataResponse.bygningAreal} m²`}
              </Text>
              <Text style={styles.row}>Reguleringsplan: {rawDataResponse.hasRegulations ? 'Ja' : 'Nei'}</Text>
              <Text style={styles.row}>Har bygning: {rawDataResponse.hasBygning ? 'Ja' : 'Nei'}</Text>
              <Text style={styles.row}>Jordskred: {rawDataResponse.hasLandslide ? 'Ja' : 'Nei'}</Text>
              <Text style={styles.row}>Flom: {rawDataResponse.hasFlood ? 'Ja' : 'Nei'}</Text>

              <Text style={styles.subtitle}>GeoJSON-innhold</Text>
              <Text style={styles.row}>Eiendomsgeometri:</Text>
              <View style={styles.codeBlock}>
                {toJsonLines(rawDataResponse.propertyGeojson).map((line, index) => (
                  <Text key={`property-${index}`} style={styles.codeLine}>{line}</Text>
                ))}
              </View>
              <Text style={styles.row}>Byggeområde:</Text>
              <View style={styles.codeBlock}>
                {toJsonLines(rawDataResponse.allowedBuildingAreaGeojson).map((line, index) => (
                  <Text key={`allowed-${index}`} style={styles.codeLine}>{line}</Text>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.row}>Ingen rådata fra eiendom</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
