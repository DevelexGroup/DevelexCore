<script lang="ts">
    // Define the type for a row in the data array
    interface DataRow {
      [key: string]: any;
    }
  
    // Props for the component
    export let data: DataRow[] = [];
    export let headers: string[] = [];
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
                {new Date(row[header]).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {:else}
                {#if row[header] !== undefined}
                  {row[header]}
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