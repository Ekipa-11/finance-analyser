export async function downloadReport() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login expired.');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/report`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response as a Blob
    const pdfBlob = await response.blob();

    // Create a URL for the Blob
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Create a temporary download link and trigger click to download immediately
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = 'report.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading the report:', error);
    console.error(error);
    alert('Could not download the report.\n' + (error.message || 'Unknown error'));
  }
}

// API/export returns a CSV file of all transactions
export async function exportTransactions() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login expired.');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/export`, {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response as a Blob
    const csvBlob = await response.blob();

    // Create a URL for the Blob
    const blobUrl = URL.createObjectURL(csvBlob);

    // Create a temporary download link and trigger click to download immediately
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = 'transactions.csv';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    alert('Could not export transactions.\n' + error.message || 'Unknown error');
  }
}
