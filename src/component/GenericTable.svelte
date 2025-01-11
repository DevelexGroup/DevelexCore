<script lang="ts">
    // Define the type for a row in the data array
    interface DataRow {
      [key: string]: any;
    }
  
    // Props for the component
    export let data: DataRow[] = [];
    export let headers: string[] = [];

    const getNestedValue = (obj: any, path: string): any => {
      if (!obj || !path) return undefined;
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    const getTime = (timestamp: number) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const pad = (num: number, size: number) => num.toString().padStart(size, '0');
    
      const hours = pad(date.getHours(), 2);
      const minutes = pad(date.getMinutes(), 2);
      const seconds = pad(date.getSeconds(), 2);
      const milliseconds = pad(date.getMilliseconds(), 3);
      
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    function formatJSON(obj: object) {
      if (!obj) return '';
      // Format JSON with line breaks and indentation
      const entries = Object.entries(obj);
      return entries.map(([key, value]) => `${key}: ${value ?? ''}`).join('\n');
    }
  </script>
  
  <div class="table-container">
    <table>
      <thead>
        <tr>
          {#each headers as header}
            <th>{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data as row}
          <tr class="w-full">
            {#each headers as header}
              <td class="table-cell w-full">
                {#if header === 'timestamp'}
                  {getTime(row?.[header])}
                {:else}
                  {@const value = getNestedValue(row, header)}
                  {#if value != null && value !== ''}
                    {#if typeof value === 'object'}
                      {formatJSON(value)}
                    {:else}
                      {JSON.stringify(value)}
                    {/if}
                  {/if}
                {/if}
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td colspan={headers.length}>No data yet</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
<style>
    .table-container {
        overflow-x: auto;
        width: 100%;
        padding-bottom: 1rem;
    }

    table {
        border: 1px solid #ddd;
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: small;
    }

    th, td {
        padding: 5px 10px;
        border-bottom: 1px solid #ddd;
        vertical-align: top;
        text-align: left;
    }

    .table-cell {
        white-space: pre-wrap;
        word-break: break-word;
        max-width: 300px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
        text-align: left;
        vertical-align: top;
    }

    tr:hover {
        background-color: #f5f5f5;
    }
</style>