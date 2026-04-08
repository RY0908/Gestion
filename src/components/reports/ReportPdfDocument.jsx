import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingBottom: 30,
        paddingHorizontal: 28,
        fontSize: 10,
        color: '#1f2937',
        fontFamily: 'Helvetica',
        lineHeight: 1.35,
    },
    header: {
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#1B6B3A',
    },
    brand: {
        fontSize: 12,
        fontWeight: 700,
        color: '#1B6B3A',
        marginBottom: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 9,
        color: '#6b7280',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    metaBox: {
        flexDirection: 'column',
        width: '31%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 4,
        backgroundColor: '#f9fafb',
    },
    metaLabel: {
        fontSize: 8,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    metaValue: {
        fontSize: 12,
        fontWeight: 700,
        color: '#1B6B3A',
    },
    section: {
        marginTop: 12,
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 6,
        color: '#111827',
    },
    table: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1B6B3A',
    },
    th: {
        paddingVertical: 6,
        paddingHorizontal: 6,
        fontSize: 8,
        fontWeight: 700,
        color: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: '#ffffff22',
    },
    row: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    rowAlt: {
        backgroundColor: '#f9fafb',
    },
    td: {
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontSize: 8,
        color: '#1f2937',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    empty: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        textAlign: 'center',
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    footer: {
        marginTop: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#d1d5db',
        fontSize: 8,
        color: '#6b7280',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})

function StatGrid({ metrics }) {
    if (!metrics?.length) return null
    return (
        <View style={[styles.metaRow, { flexWrap: 'wrap' }]}>
            {metrics.map((metric, index) => (
                <View key={`${metric.label}-${index}`} style={[styles.metaBox, { width: '48%', marginBottom: 8 }]}>
                    <Text style={styles.metaLabel}>{metric.label}</Text>
                    <Text style={styles.metaValue}>{metric.value}</Text>
                    {metric.hint ? <Text style={{ fontSize: 7, color: '#6b7280', marginTop: 3 }}>{metric.hint}</Text> : null}
                </View>
            ))}
        </View>
    )
}

function ReportTable({ section }) {
    return (
        <View style={styles.table}>
            <View style={styles.tableHeader}>
                {section.columns.map((column, index) => (
                    <Text
                        key={column.key}
                        style={[
                            styles.th,
                            {
                                flex: column.flex || 1,
                                textAlign: column.align || 'left',
                                borderRightWidth: index === section.columns.length - 1 ? 0 : 1,
                            },
                        ]}
                    >
                        {column.label}
                    </Text>
                ))}
            </View>

            {section.rows?.length ? section.rows.map((row, rowIndex) => (
                <View key={`${section.title}-${rowIndex}`} style={[styles.row, rowIndex % 2 === 1 && styles.rowAlt]}>
                    {section.columns.map((column, columnIndex) => (
                        <Text
                            key={column.key}
                            style={[
                                styles.td,
                                {
                                    flex: column.flex || 1,
                                    textAlign: column.align || 'left',
                                    borderRightWidth: columnIndex === section.columns.length - 1 ? 0 : 1,
                                },
                            ]}
                        >
                            {row[column.key] ?? '—'}
                        </Text>
                    ))}
                </View>
            )) : (
                <View>
                    <Text style={styles.empty}>{section.emptyMessage || 'Aucune donnée disponible.'}</Text>
                </View>
            )}
        </View>
    )
}

export function ReportPdfDocument({ payload }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.brand}>SIGMA</Text>
                    <Text style={styles.title}>{payload?.title || 'Rapport'}</Text>
                    <Text style={styles.subtitle}>{payload?.subtitle || 'Rapport administratif'}</Text>
                    <View style={styles.metaRow}>
                        <View style={{ width: '48%' }}>
                            <Text style={styles.metaLabel}>Période</Text>
                            <Text style={styles.metaValue}>{payload?.periodLabel || '—'}</Text>
                        </View>
                        <View style={{ width: '48%', alignItems: 'flex-end' }}>
                            <Text style={styles.metaLabel}>Généré le</Text>
                            <Text style={styles.metaValue}>{payload?.generatedAt || '—'}</Text>
                        </View>
                    </View>
                </View>

                <StatGrid metrics={payload?.metrics || []} />

                {(payload?.sections || []).map((section, index) => (
                    <View key={`${section.title}-${index}`} style={styles.section} wrap={true}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <ReportTable section={section} />
                    </View>
                ))}

                <View fixed style={styles.footer}>
                    <Text>Document généré automatiquement depuis SIGMA</Text>
                    <Text>Export PDF</Text>
                </View>
            </Page>
        </Document>
    )
}
