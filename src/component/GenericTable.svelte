<script lang="ts">
    // Define the type for a row in the data array
    interface DataRow {
      [key: string]: any;
    }
  
    // Props for the component
    export let data: DataRow[] = [];
    export let headers: string[] = [];

    const getNestedValue = (obj: any, path: string): any =>{
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    const getTime = (timestamp: number) => {
      const date = new Date(timestamp);
      const pad = (num: number, size: number) => num.toString().padStart(size, '0');
    
      const hours = pad(date.getHours(), 2);
      const minutes = pad(date.getMinutes(), 2);
      const seconds = pad(date.getSeconds(), 2);
      const milliseconds = pad(date.getMilliseconds(), 3);
      
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
  </script>
  
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
        <tr>
          {#each headers as header}
            <td>
              {#if header === 'timestamp'}
                {getTime(row[header])}
              {:else}
                {#if getNestedValue(row, header) !== undefined}
                  {getNestedValue(row, header)}
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
  
<style>
    table {
        overflow-x: auto;
        border: 1px solid #ddd;
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: small;
    }

    tbody {
        min-width: 800px;
    }

    th, td {
        padding: 5px 10px;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #f5f5f5;
    }
</style>